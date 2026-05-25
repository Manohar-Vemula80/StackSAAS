import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [risk, setRisk] = useState("medium");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || "https://stacksaas.onrender.com";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/login/success`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.error) {
          navigate("/login");
        } else {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">👤 Profile</h1>

        <button
          onClick={() => navigate("/")}
          className="bg-indigo-600 px-4 py-2 rounded-lg"
        >
          Back
        </button>
      </div>

      {/* User Info */}
      <div className="bg-[#111827] p-6 rounded-xl mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gray-500 flex items-center justify-center text-xl">
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>

        <div>
          <h2 className="text-lg font-semibold">{user.name || "User Name"}</h2>
          <p className="text-gray-400 text-sm">{user.email || "user@email.com"}</p>
        </div>
      </div>

      {/* Risk Selection */}
      <div className="bg-[#111827] p-6 rounded-xl mb-6">
        <h3 className="text-lg font-semibold mb-4">
          ⚠️ Risk Preference
        </h3>

        <div className="grid grid-cols-3 gap-4">

          {["low", "medium", "high"].map((level) => (
            <div
              key={level}
              onClick={() => setRisk(level)}
              className={`p-4 rounded-xl cursor-pointer text-center border transition ${
                risk === level
                  ? "border-indigo-500 bg-white/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <h4 className="font-semibold capitalize">{level}</h4>

              <p className="text-xs text-gray-400 mt-2">
                {level === "low" && "Safe investments"}
                {level === "medium" && "Balanced risk"}
                {level === "high" && "High return focus"}
              </p>
            </div>
          ))}

        </div>
      </div>

      {/* Settings */}
      <div className="bg-[#111827] p-6 rounded-xl mb-6">
        <h3 className="text-lg font-semibold mb-4">
          ⚙️ Settings
        </h3>

        <div className="space-y-4 text-gray-300">
          <div className="flex justify-between">
            <span>Notifications</span>
            <span>ON</span>
          </div>

          <div className="flex justify-between">
            <span>Dark Mode</span>
            <span>Enabled</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={() => {
          alert(`Risk set to: ${risk}`);
        }}
        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold"
      >
        Save Preferences 🚀
      </button>

    </div>
  );
}