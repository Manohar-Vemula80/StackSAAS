import { CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState({
    credits: 0,
    amount: 0,
    txn: "N/A",
  });

  useEffect(() => {
    if (location.state) {
      // ✅ from navigation
      setData(location.state);

      // 💾 SAVE FOR REFRESH
      localStorage.setItem("lastPayment", JSON.stringify(location.state));
    } else {
      // 🔁 fallback after refresh
      const saved = localStorage.getItem("lastPayment");
      if (saved) {
        setData(JSON.parse(saved));
      }
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-6">

      <div className="bg-[#111827] p-8 rounded-2xl text-center max-w-md w-full shadow-xl">

        <CheckCircle className="text-green-400 mx-auto mb-4" size={70} />

        <h1 className="text-2xl font-bold mb-2">
          Payment Successful 🎉
        </h1>

        <p className="text-gray-400 mb-6">
          Your credits have been added successfully
        </p>

        <div className="bg-[#1F2937] p-4 rounded-xl mb-6 text-left space-y-2">

          <div className="flex justify-between">
            <span>Credits Added</span>
            <span className="text-green-400 font-semibold">
              +{data.credits}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Amount Paid</span>
            <span className="font-semibold">
              ₹{data.amount}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Transaction ID</span>
            <span className="text-xs break-all">
              {data.txn}
            </span>
          </div>

        </div>

        <button
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold"
          onClick={() => navigate("/")}
        >
          Back to Dashboard 🚀
        </button>

      </div>
    </div>
  );
}