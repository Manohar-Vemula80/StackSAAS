import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCredit } from "../context/creditscontext";

const plans = [
  { credits: 10, price: 99 },
  { credits: 50, price: 399, popular: true },
  { credits: 100, price: 699 },
];

export default function PaymentPage() {
  const API_BASE = import.meta.env.VITE_API_URL || "";
  const navigate = useNavigate();
  const { addCredits } = useCredit();

  const [selectedPlan, setSelectedPlan] = useState(plans[1]);
  const [loading, setLoading] = useState(false);

  // 🔥 LOAD RAZORPAY SCRIPT
  const loadScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 🔥 MAIN PAYMENT FUNCTION
  const handlePayment = async () => {
    setLoading(true);

    const loaded = await loadScript();
    if (!loaded) {
      alert("Razorpay failed to load");
      return;
    }

    try {
      // 🟢 1. CREATE ORDER
      const res = await fetch(
        `${API_BASE}/api/payment/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: selectedPlan.price,
            credits: selectedPlan.credits,
          }),
        }
      );

      const data = await res.json();

      // 🟢 2. OPEN RAZORPAY
      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        order_id: data.orderId,

        name: "StockAI",
        description: `${selectedPlan.credits} Credits Purchase`,

        // ✅ 🔥 UPDATED HANDLER
        handler: async function (response) {

          const verifyRes = await fetch(
            `${API_BASE}/api/payment/verify`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            }
          );

          const verifyData = await verifyRes.json();

          if (verifyData.success) {

            // 🔥 ADD CREDITS
            addCredits(verifyData.credits);

            // 🔥 PASS DATA TO SUCCESS PAGE (MAIN FIX)
            navigate("/success", {
              state: {
                credits: verifyData.credits,
                amount: selectedPlan.price,
                txn: response.razorpay_payment_id,
              },
            });

          } else {
            alert("Payment verification failed");
          }
        },

        theme: {
          color: "#6366f1",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-6 flex justify-center">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8">

        {/* LEFT */}
        <div>
          <h1 className="text-3xl font-bold mb-6">💰 Buy Credits</h1>

          <div className="space-y-4">
            {plans.map((plan, i) => (
              <div
                key={i}
                onClick={() => setSelectedPlan(plan)}
                className={`p-5 rounded-xl cursor-pointer border ${
                  selectedPlan.credits === plan.credits
                    ? "border-indigo-500 bg-white/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <h2>{plan.credits} Credits</h2>
                <p>₹{plan.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-[#111827] p-6 rounded-xl">

          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

          <div className="flex justify-between">
            <span>Credits</span>
            <span>{selectedPlan.credits}</span>
          </div>

          <div className="flex justify-between">
            <span>Price</span>
            <span>₹{selectedPlan.price}</span>
          </div>

          <div className="border-t border-gray-700 my-4"></div>

          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹{selectedPlan.price}</span>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="mt-6 w-full py-4 bg-indigo-600 rounded-xl"
          >
            {loading ? "Processing..." : "Pay Now 🚀"}
          </button>

        </div>
      </div>
    </div>
  );
}