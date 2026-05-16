import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import StockChart from "./charts";

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);

  const result = location.state?.result;

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div className="text-white p-10 text-center">
        ⏳ Loading analysis...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-white p-10 text-center">
        ❌ No analysis data found  
        <br />
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-indigo-600 px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  const {
    symbol,
    score = 50,
    recommendation = "HOLD",
    analysis = "No AI analysis available",
    news = [],
    risk = "Unknown",
    history = [],
  } = result;

  // ✅ BACKEND BASED RECOMMENDATION
  let finalRecommendation = recommendation;

  let color = "text-yellow-400";
  let Icon = Minus;

  if (finalRecommendation === "BUY") {
    color = "text-green-400";
    Icon = ArrowUpRight;
  } else if (finalRecommendation === "SELL") {
    color = "text-red-400";
    Icon = ArrowDownRight;
  }

  const formattedAnalysis = analysis
    .split("\n")
    .filter(line => line.trim() !== "");

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          📊 {symbol} Analysis
        </h1>

        <button
          onClick={() => navigate("/history")}
          className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          View History 📜
        </button>
      </div>

      {/* Score + Recommendation */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">

        <div className="bg-[#111827] p-6 rounded-xl">
          <p className="text-gray-400">Overall Score</p>
          <h2 className="text-5xl font-bold mt-2 text-indigo-400">
            {Math.round(score)}/100
          </h2>
        </div>

        <div className="bg-[#111827] p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-gray-400">Recommendation</p>
            <h2 className={`text-3xl font-bold ${color}`}>
              {finalRecommendation}
            </h2>
          </div>

          <Icon className={color} size={40} />
        </div>

      </div>

      {/* AI Explanation */}
      <div className="bg-[#111827] p-6 rounded-xl mb-6">
        <h3 className="text-lg font-semibold mb-3">🤖 AI Explanation</h3>

        <div className="space-y-2 text-gray-300 leading-relaxed">
          {formattedAnalysis.map((line, index) => (
            <p key={index}>• {line}</p>
          ))}
        </div>
      </div>

      {/* Chart */}
      {history.length > 0 && <StockChart data={history} />}

      {/* Risk */}
      <div className="bg-[#111827] p-6 rounded-xl mb-6">
        <h3 className="text-lg font-semibold mb-3">⚠️ Risk Level</h3>

        <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full">
          {risk}
        </span>
      </div>

      {/* News */}
      <div className="bg-[#111827] p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">📰 News Analysis</h3>

        <div className="space-y-4">

          {news.length === 0 && (
            <p className="text-gray-400">No news found</p>
          )}

          {news.map((item, index) => (
            <div
              key={index}
              onClick={() => item.url && window.open(item.url, "_blank")}
              className="flex justify-between items-center bg-[#1F2937] p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-400">
                  {item.source}
                </p>
              </div>

              <span className="px-3 py-1 text-sm rounded-full bg-indigo-500/20 text-indigo-400">
                News
              </span>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}