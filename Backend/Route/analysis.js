const express = require("express");
const router = express.Router();
const axios = require("axios");

const YahooFinance = require("yahoo-finance2").default;
const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
  validation: { logErrors: false, logOptionsErrors: false },
});

const Stock = require("../Model/stock");

function normalizeYahooSymbol(symbol) {
  const trimmed = symbol.trim().toUpperCase();
  // US share-class tickers (BRK.A, BF.B) use hyphens on Yahoo; exchange suffixes (BR.TO) keep the dot.
  if (/\.[A-Z]$/.test(trimmed)) {
    return trimmed.replace(".", "-");
  }
  return trimmed;
}

function getYahooSymbolCandidates(symbol) {
  const trimmed = symbol.trim().toUpperCase();
  const normalized = normalizeYahooSymbol(trimmed);
  return [...new Set([normalized, trimmed])];
}

async function fetchQuote(candidates) {
  let lastError;

  for (const sym of candidates) {
    try {
      const quote = await yahooFinance.quote(sym);
      const price =
        quote?.regularMarketPrice ?? quote?.regularMarketPreviousClose;

      if (price != null) {
        return { price, yahooSymbol: sym };
      }
    } catch (err) {
      lastError = err;
      console.log(`Quote failed for ${sym}:`, err.message);
    }
  }

  throw lastError || new Error("Unable to fetch stock price");
}

async function fetchHistory(yahooSymbol, period1, period2, candidates) {
  const symbolsToTry = [...new Set([yahooSymbol, ...candidates])];

  for (const sym of symbolsToTry) {
    try {
      const historyData = await yahooFinance.chart(sym, {
        period1,
        period2,
        interval: "1d",
      });

      if (historyData?.quotes?.length) {
        return historyData.quotes.map((q) => q.close).filter(Boolean);
      }
    } catch (err) {
      console.log(`Chart failed for ${sym}:`, err.message);
    }
  }

  return [];
}

router.post("/", async (req, res) => {
  const { symbol } = req.body;

  if (!symbol || typeof symbol !== "string" || !symbol.trim()) {
    return res.status(400).json({ error: "Enter a valid stock symbol" });
  }

  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.user.credits <= 0) {
    return res.status(400).json({ error: "Not enough credits" });
  }

  const displaySymbol = symbol.trim().toUpperCase();
  const yahooCandidates = getYahooSymbolCandidates(displaySymbol);

  try {
    const { price, yahooSymbol } = await fetchQuote(yahooCandidates);

    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    const history = await fetchHistory(
      yahooSymbol,
      weekAgo,
      now,
      yahooCandidates
    );

    let news = [];

    try {
      const newsRes = await axios.get("https://newsapi.org/v2/everything", {
        params: {
          q: displaySymbol.split(".")[0],
          apiKey: process.env.NEWS_API_KEY,
          pageSize: 5,
        },
      });

      news = (newsRes.data.articles || []).map((n) => ({
        title: n.title,
        source: n.source.name,
        url: n.url,
      }));
    } catch (err) {
      console.log("News API failed (ignored)");
    }

    let trend = "stable";

    if (history.length > 1) {
      if (history[history.length - 1] > history[0]) trend = "uptrend";
      else trend = "downtrend";
    }

    let recommendation = "HOLD";
    if (trend === "uptrend") recommendation = "BUY";
    if (trend === "downtrend") recommendation = "SELL";

    let score = 50;

    if (trend === "uptrend") score += 20;
    if (trend === "downtrend") score -= 20;
    if (news.length > 2) score += 10;
    if (price > 100) score += 10;

    score = Math.max(0, Math.min(100, score));

    const aiText = `Stock ${displaySymbol} is trading at ${price}.
Trend: ${trend}.
Recommendation: ${recommendation}.
Risk level is ${trend === "uptrend" ? "Low" : "High"}.
Recent news may impact future performance.`;

    req.user.credits -= 1;
    await req.user.save();

    await Stock.create({
      user: req.user._id,
      symbol: displaySymbol,
      recommendation,
      price,
      score,
    });

    res.json({
      data: {
        symbol: displaySymbol,
        score,
        recommendation,
        analysis: aiText,
        risk: trend === "uptrend" ? "Low" : "High",
        history,
        news,
      },
      credits: req.user.credits,
    });
  } catch (err) {
    console.error("Analysis error:", err.response?.data || err.message);

    const message =
      err.name === "FailedYahooValidationError" ||
      err.message?.includes("No data found")
        ? "Unable to fetch market data for this symbol"
        : "Analysis failed";

    res.status(500).json({ error: message });
  }
});

module.exports = router;
