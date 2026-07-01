import {
  LayoutDashboard,
  BarChart2,
  Wallet,
  FileText,
  Users,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCredit } from "../context/creditscontext";
import { useEffect } from "react";
import { useUser } from "../context/usercontext";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stock, setStock] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recent, setRecent] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { credits, deductCredits, updateCredits } = useCredit();
  const { user, setUser, loading: userLoading } = useUser();
  const API_BASE = import.meta.env.VITE_API_URL || "https://stacksaas.onrender.com";
 
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      if (setUser) setUser(null);
      setRecent([]);
      navigate("/login");
    }
  };
 
  const fetchRecent = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE}/api/recent`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();
      if (Array.isArray(data)) {
        setRecent(data);
      } else {
        setRecent([]);
      }
    } catch (err) {
      console.error(err);
      setRecent([]);
    }
  };

  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/login");
      return;
    }

    if (!user) {
      setRecent([]);
      return;
    }

    fetchRecent();
  }, [user, userLoading, navigate]);

  const handleSearch = async (value) => {
    setStock(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/search?query=${value}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setSuggestions(data);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setSuggestions([]);
    }
  };

  const handleAnalyze = async () => {
    if (!stock) return alert("Enter stock name");

    if (credits <= 0) {
      alert("You have no credits. Please buy more credits first.");
      navigate("/payment");
      return;
    }

    const symbol = stock.trim().toUpperCase();
    setAnalyzing(true);

    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol }),
      });
      const data = await res.json();

      if (!res.ok || !data || data.error) {
        alert(data?.error || "Analysis failed");
        return;
      }

      if (setUser && data.credits != null) {
        const normalizedCredits = Number(data.credits);
        setUser({ ...user, credits: normalizedCredits });
        updateCredits(normalizedCredits);
      }

      await fetchRecent();
      navigate("/result", { state: { result: data.data } });
    } catch (err) {
      console.error("Analyze request failed:", err);
      alert("Analysis failed — the server may be waking up. Wait 30 seconds and try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen bg-[#0B0F19] text-white items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`bg-gradient-to-b from-purple-700 to-indigo-600 p-6 flex flex-col justify-between rounded-r-3xl md:w-64 md:min-h-screen md:relative ${
          sidebarOpen
            ? "fixed inset-y-0 left-0 z-30 w-full max-w-xs h-full rounded-none shadow-xl"
            : "hidden md:flex"
        }`}
      >
        <div>
          <div className="flex items-center justify-between md:hidden mb-6">
            <h1 className="text-2xl font-bold">📊 StockAI</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white bg-white/10 px-3 py-2 rounded-lg"
            >
              Close
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-10 hidden md:block">📊 StockAI</h1>

          <nav className="space-y-4 text-sm">
            <div
              onClick={() => {
                navigate("/");
                setSidebarOpen(false);
              }}
              className="flex items-center gap-3 bg-white text-black px-4 py-3 rounded-xl cursor-pointer"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </div>

            <div
              onClick={() => {
                navigate("/payment");
                setSidebarOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/10"
            >
              <Wallet size={18} /> Buy Credits
            </div>

            <div
              onClick={() => {
                navigate("/history");
                setSidebarOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/10"
            >
              <FileText size={18} /> History
            </div>

            <div
              onClick={() => {
                navigate("/profile");
                setSidebarOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/10"
            >
              <Users size={18} /> Profile
            </div>

            <div
              onClick={() => {
                navigate("/setting");
                setSidebarOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/10"
            >
              <Settings size={18} /> Settings
            </div>
          </nav>
        </div>

        <div
          onClick={() => {
            handleLogout();
            setSidebarOpen(false);
          }}
          className="flex items-center gap-2 cursor-pointer mt-6"
        >
          <LogOut size={18} /> Logout
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-white bg-white/10 px-3 py-2 rounded-lg"
              >
                Menu
              </button>
              <div>
                <p className="text-sm text-gray-400">Hello</p>
                <h2 className="text-2xl font-semibold">Welcome 👋{user ? `, ${user.name}` : ""}</h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-[#1F2937] px-4 py-2 rounded-lg">
                💰 {credits} Credits
              </div>
              <div className="w-11 h-11 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                {user ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
          </div>

          <div className="bg-[#111827] p-6 rounded-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Analyze Stock</h3>
                <p className="text-sm text-gray-400">Enter a ticker to get fast AI stock insight.</p>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full md:w-auto bg-indigo-600 px-5 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? "Analyzing..." : "Analyze 🚀"}
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1 relative">
                <input
                  value={stock}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Enter stock (RELIANCE / AAPL)"
                  className="w-full p-3 rounded-lg bg-[#1F2937] border border-gray-700 focus:outline-none"
                />

                {suggestions.length > 0 && (
                  <div className="absolute w-full bg-[#1F2937] mt-2 rounded-lg max-h-60 overflow-y-auto z-10">
                    {suggestions.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setStock(item.symbol);
                          setSuggestions([]);
                        }}
                        className="p-3 hover:bg-gray-700 cursor-pointer"
                      >
                        {item.symbol} - {item.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <div className="bg-[#111827] p-5 rounded-xl">
              <p className="text-gray-400">Total Analyses</p>
              <h2 className="text-2xl font-bold mt-2">{recent.length}</h2>
            </div>
            <div className="bg-[#111827] p-5 rounded-xl">
              <p className="text-gray-400">Credits Left</p>
              <h2 className="text-2xl font-bold mt-2 text-green-400">{credits}</h2>
            </div>
            <div className="bg-[#111827] p-5 rounded-xl">
              <p className="text-gray-400">Success Rate</p>
              <h2 className="text-2xl font-bold mt-2 text-indigo-400">87%</h2>
            </div>
          </div>

          <div className="bg-[#111827] p-6 rounded-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Analyses</h3>
              <span className="text-sm text-gray-400">Latest 3 results</span>
            </div>

            <div className="space-y-4">
              {recent.length === 0 && <p className="text-gray-400">No recent analysis</p>}

              {recent.slice(0, 3).map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between bg-[#1F2937] p-4 rounded-lg gap-2">
                  <span>{item.symbol}</span>
                  <span
                    className={
                      item.recommendation === "BUY"
                        ? "text-green-400"
                        : item.recommendation === "SELL"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }
                  >
                    {item.recommendation}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
