import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoadingScreen({ stock = "RELIANCE" }) {
  const navigate = useNavigate();

  const steps = [
    "Fetching Market Data",
    "Calculating Indicators",
    "Running AI Model",
    "Generating Insights",
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });

      setProgress((prev) => {
        if (prev < 100) return prev + 25;
        return 100;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // 🔥 Auto redirect after complete
  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => {
        navigate("/result");
      }, 800);
    }
  }, [progress]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white">

      <div className="text-center w-full max-w-md">

        {/* Title */}
        <h1 className="text-2xl font-semibold mb-2">
          Analyzing {stock}...
        </h1>
        <p className="text-gray-400 mb-6">
          AI is processing real-time data
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-[#1F2937] rounded-full h-2 mb-6">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-400 mb-6">
          {progress}% complete
        </p>

        {/* Spinner */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Steps */}
        <div className="space-y-4 text-left">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                index <= currentStep
                  ? "bg-white/5 border border-white/10"
                  : "opacity-40"
              }`}
            >
              <span>
                {index < currentStep ? "✅" : index === currentStep ? "⏳" : "•"}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}