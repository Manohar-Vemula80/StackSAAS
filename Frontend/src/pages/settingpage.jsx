import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/usercontext";

export default function SettingsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // 🔥 Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch current user details
  const API_BASE = import.meta.env.VITE_API_URL || "https://stacksaas.onrender.com";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/status`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.error || data.authenticated === false) {
          navigate("/login");
          return;
        }

        setName(data.user?.name || "");
        setEmail(data.user?.email || "");
      } catch (error) {
        console.error("Error fetching user details:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const { setUser } = useUser();

  // 🔥 Load theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, []);

  // 🔥 Toggle dark mode
  const handleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // 🔥 Save settings
  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/update`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();
      if (!data.success) {
        alert(data.message || "Save failed");
        return;
      }

      setName(data.user.name || "");
      setEmail(data.user.email || "");
      // update global user context so other components refresh
      if (setUser) setUser(data.user);
      alert("Profile updated successfully ✅");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Unable to save settings");
    }
  };

  // 🔥 Reset settings
  const handleReset = () => {
    setNotifications(true);
    setDarkMode(true);
    setName("");
    setEmail("");
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black dark:bg-[#0B0F19] dark:text-white flex items-center justify-center p-6">
        <div className="text-xl">Loading user details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#0B0F19] dark:text-white p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">⚙️ Settings</h1>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-indigo-600 px-4 py-2 rounded-lg text-white"
        >
          Back
        </button>
      </div>

      {/* 🔥 Profile Edit */}
      <div className="bg-gray-100 dark:bg-[#111827] p-6 rounded-xl mb-6">
        <h3 className="text-lg font-semibold mb-4">👤 Profile</h3>

        <div className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-lg bg-white dark:bg-[#1F2937]"
            placeholder="Name"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white dark:bg-[#1F2937]"
            placeholder="Email"
          />
        </div>
      </div>

      {/* 🔥 Preferences */}
      <div className="bg-gray-100 dark:bg-[#111827] p-6 rounded-xl mb-6">
        <h3 className="text-lg font-semibold mb-4">⚙️ Preferences</h3>

        {/* Notifications */}
        <div className="flex justify-between items-center mb-4">
          <span>Notifications</span>

          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 flex items-center rounded-full p-1 ${
              notifications ? "bg-indigo-600" : "bg-gray-400"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition ${
                notifications ? "ml-6" : "ml-0"
              }`}
            />
          </button>
        </div>

        {/* Dark Mode */}
        <div className="flex justify-between items-center">
          <span>Dark Mode</span>

          <button
            onClick={handleDarkMode}
            className={`w-12 h-6 flex items-center rounded-full p-1 ${
              darkMode ? "bg-indigo-600" : "bg-gray-400"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition ${
                darkMode ? "ml-6" : "ml-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* 🔥 Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleSave}
          className="py-3 bg-indigo-600 rounded-xl font-semibold text-white"
        >
          Save Changes 💾
        </button>

        <button
          onClick={handleReset}
          className="py-3 bg-gray-500 rounded-xl font-semibold text-white"
        >
          Reset 🔄
        </button>
      </div>

      {/* 🔥 Danger Zone */}
      <div className="bg-gray-100 dark:bg-[#111827] p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 text-red-400">
          ⚠️ Danger Zone
        </h3>

        <button
          className="w-full py-3 bg-red-600 rounded-xl font-semibold hover:bg-red-700 text-white"
          onClick={() => navigate("/")}
        >
          Logout
        </button>
      </div>

    </div>
  );
}