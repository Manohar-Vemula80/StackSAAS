import {
  LayoutDashboard,
  BarChart2,
  Wallet,
  FileText,
  Users,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ArrowLeft,
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
  const { credits, deductCredits, updateCredits } = useCredit();
  const { user, setUser, loading: userLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // 🔍 SEARCH STOCK API
  const handleSearch = async (value) => {
    setStock(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/search?query=${value}`
      );
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

  // 🚀 ANALYZE STOCK API
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

      // Refresh user-specific recent history after a successful analysis.
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
      <div className="flex h-screen bg-[#0B0F19] text-white items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex h-screen bg-[#0B0F19] text-white overflow-hidden">

      {/* 🔁 Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 sm:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 🟣 Sidebar - hidden on small screens, slide-in on mobile */}
      <div className={`fixed z-40 inset-y-0 left-0 w-3/4 max-w-xs transform bg-gradient-to-b from-purple-700 to-indigo-600 p-6 flex flex-col justify-between rounded-r-3xl transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 sm:static sm:w-64 sm:rounded-r-3xl`}> 

        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold mb-4">📊 StockAI</h1>
            <div className="flex items-center gap-2">
              <button className="sm:hidden flex items-center gap-2 px-3 py-2 bg-black/20 rounded-md" onClick={() => setSidebarOpen(false)} aria-label="Back">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button className="hidden sm:block" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
                <X />
              </button>
            </div>
          </div>

          <nav className="space-y-5 text-sm">

            <div
              onClick={() => { navigate('/'); setSidebarOpen(false); }}
              className="flex items-center gap-3 bg-white text-black px-4 py-2 rounded-xl">
              <LayoutDashboard size={18} />
              Dashboard
            </div>

            <div onClick={() => { navigate('/payment'); setSidebarOpen(false); }} className="flex items-center gap-3 cursor-pointer">
              <Wallet size={18} /> Buy Credits
            </div>

            <div onClick={() => { navigate('/history'); setSidebarOpen(false); }} className="flex items-center gap-3 cursor-pointer">
              <FileText size={18} /> History
            </div>

            <div onClick={() => { navigate('/profile'); setSidebarOpen(false); }} className="flex items-center gap-3 cursor-pointer">
              <Users size={18} /> Profile
            </div>

            <div onClick={() => { navigate('/setting'); setSidebarOpen(false); }} className="flex items-center gap-3 cursor-pointer">
              <Settings size={18} /> Settings
            </div>
          </nav>
        </div>

        <div onClick={handleLogout} className="flex items-center gap-2 cursor-pointer">
          <LogOut size={18} /> Logout
        </div>
      </div>

      {/* 🔵 Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">

        {/* Topbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {!sidebarOpen ? (
              <button className="sm:hidden mr-2 p-2 rounded-md bg-gray-800" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <Menu />
              </button>
            ) : (
              <button className="sm:hidden mr-2 p-2 rounded-md bg-gray-800" onClick={() => setSidebarOpen(false)} aria-label="Back">
                <ArrowLeft />
              </button>
            )}
            <h2 className="text-xl font-semibold">Welcome 👋{user ? `, ${user.name}` : ""}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#1F2937] px-4 py-2 rounded-lg">💰 {credits} Credits</div>
            <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">{user ? user.name.charAt(0).toUpperCase() : "U"}</div>
          </div>
        </div>

        {/* 🔥 Stock Input Section */}
          <div className="bg-[#111827] p-6 rounded-xl mb-6">
          <h3 className="text-lg font-semibold mb-4">
            Analyze Stock
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">

              <input
                value={stock}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Enter stock (RELIANCE / AAPL)"
                className="w-full p-3 rounded-lg bg-[#1F2937] border border-gray-700 focus:outline-none"
              />

              {/* 🔍 Suggestions */}
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

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="bg-indigo-600 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {analyzing ? "Analyzing..." : "Analyze 🚀"}
            </button>
          </div>
        </div>

        {/* 🔥 Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

          <div className="bg-[#111827] p-5 rounded-xl">
            <p className="text-gray-400">Total Analyses</p>
            <h2 className="text-2xl font-bold mt-2">{recent.length}</h2>
          </div>

          <div className="bg-[#111827] p-5 rounded-xl">
            <p className="text-gray-400">Credits Left</p>
            <h2 className="text-2xl font-bold mt-2 text-green-400">
              {credits}
            </h2>
          </div>

          <div className="bg-[#111827] p-5 rounded-xl">
            <p className="text-gray-400">Success Rate</p>
            <h2 className="text-2xl font-bold mt-2 text-indigo-400">
              87%
            </h2>
          </div>

        </div>

        {/* 🔥 Recent Activity */}
        <div className="bg-[#111827] p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">
            Recent Analyses
          </h3>

          <div className="space-y-4">

            {recent.length === 0 && (
              <p className="text-gray-400">No recent analysis</p>
            )}

            {recent.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between bg-[#1F2937] p-4 rounded-lg">
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
    </div>
  );
}