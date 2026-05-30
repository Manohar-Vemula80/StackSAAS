const express = require("express");
const router = express.Router();
const axios = require("axios");

const YahooFinance = require("yahoo-finance2").default;
const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

const Stock = require("../Model/stock");

router.post("/", async (req, res) => {
  const { symbol } = req.body;

  try {
    const normalizedSymbol = symbol.trim().toUpperCase().replace(/\./g, "-");

    // 🔥 1. STOCK PRICE
    const quote = await yahooFinance.quote(normalizedSymbol);
    const price = quote.regularMarketPrice;

    if (!price) {
      return res.json({ error: "Invalid stock" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.credits <= 0) {
      return res.status(400).json({ error: "Not enough credits" });
    }

    req.user.credits -= 1;
    await req.user.save();

    // 🔥 2. DATE
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    // 🔥 3. HISTORY
    const historyData = await yahooFinance.chart(symbol, {
      period1: weekAgo,
      period2: now,
      interval: "1d",
    });

    let history = [];

    if (historyData && historyData.quotes) {
      history = historyData.quotes
        .map((q) => q.close)
        .filter(Boolean);
    }

    // 🔥 4. NEWS
    let news = [];

    try {
      const newsRes = await axios.get(
        "https://newsapi.org/v2/everything",
        {
          params: {
            q: symbol.split(".")[0],
            apiKey: process.env.NEWS_API_KEY,
            pageSize: 5,
          },
        }
      );

      news = newsRes.data.articles.map((n) => ({
        title: n.title,
        source: n.source.name,
        url: n.url,
      }));
    } catch (err) {
      console.log("News API failed (ignored)");
    }

    // 🔥 5. TREND
    let trend = "stable";

    if (history.length > 1) {
      if (history[history.length - 1] > history[0]) trend = "uptrend";
      else trend = "downtrend";
    }

    let recommendation = "HOLD";
    if (trend === "uptrend") recommendation = "BUY";
    if (trend === "downtrend") recommendation = "SELL";

    // 🔥 6. REAL SCORE (NOT RANDOM ❌)
    let score = 50;

    if (trend === "uptrend") score += 20;
    if (trend === "downtrend") score -= 20;
    if (news.length > 2) score += 10;
    if (price > 100) score += 10;

    // limit 0-100
    score = Math.max(0, Math.min(100, score));

    // 🔥 7. AI TEXT
    let aiText = `Stock ${symbol} is trading at ${price}.
Trend: ${trend}.
Recommendation: ${recommendation}.
Risk level is ${trend === "uptrend" ? "Low" : "High"}.
Recent news may impact future performance.`;

    // 🔥 8. SAVE TO DB (IMPORTANT)
    await Stock.create({
      user: req.user._id,
      symbol,
      recommendation,
      price,
      score, // ✅ NOW SAVED
    });

    // 🔥 FINAL RESPONSE
    res.json({
      data: {
        symbol,
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
    console.error("ERROR:", err.response?.data || err.message);

    res.json({
      error: "Analysis failed",
    });
  }
});

module.exports = router;