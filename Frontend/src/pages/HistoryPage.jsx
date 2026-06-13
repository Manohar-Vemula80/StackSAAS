import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../context/usercontext";

const getHistoryKey = (userId) => `history_${userId}`;

export default function HistoryPage() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "https://stacksaas.onrender.com";

  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      setHistoryData([]);
      setLoading(false);
      return;
    }

    const saved = typeof window !== "undefined" ? localStorage.getItem(getHistoryKey(user._id)) : null;
    if (saved) {
      try {
        setHistoryData(JSON.parse(saved));
      } catch (err) {
        console.warn("Failed to parse saved user history:", err);
      }
    }

    setLoading(true);
    fetch(`${API_BASE}/api/recent`, {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const parsed = Array.isArray(data) ? data : [];
        setHistoryData(parsed);
        if (typeof window !== "undefined") {
          localStorage.setItem(getHistoryKey(user._id), JSON.stringify(parsed));
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, userLoading]);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📜 Analysis History</h1>

        <button
          onClick={() => navigate("/")}
          className="bg-indigo-600 px-4 py-2 rounded-lg"
        >
          Back
        </button>
      </div>

      {loading && (
        <p className="text-gray-400">Loading history...</p>
      )}

      {!loading && historyData.length === 0 && (
        <p className="text-gray-400">No history found</p>
      )}

      <div className="space-y-4">

        {historyData.map((item, index) => {

          // ✅ BACKEND RECOMMENDATION USE
          let action = item.recommendation || "HOLD";

          return (
            <div
              key={index}
              onClick={() =>
                navigate("/result", {
                  state: { result: item },
                })
              }
              className="bg-[#111827] p-5 rounded-xl flex justify-between items-center cursor-pointer hover:bg-[#1F2937] transition"
            >
              <div>
                <h2 className="text-lg font-semibold">
                  {item.symbol}
                </h2>
                <p className="text-gray-400 text-sm">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold">
                  {item.score ? Math.round(item.score) : 50}
                </p>

                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    action === "BUY"
                      ? "bg-green-500/20 text-green-400"
                      : action === "SELL"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {action}
                </span>
              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
}