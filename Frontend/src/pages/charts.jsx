import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

const mockData = {
  "1W": [
    { day: "Mon", price: 2200 },
    { day: "Tue", price: 2400 },
    { day: "Wed", price: 2300 },
    { day: "Thu", price: 2600 },
    { day: "Fri", price: 2500 },
  ],
  "1M": [
    { day: "Week1", price: 2100 },
    { day: "Week2", price: 2500 },
    { day: "Week3", price: 2700 },
    { day: "Week4", price: 2600 },
  ],
};

export default function StockChart() {
  const [range, setRange] = useState("1W");

  return (
    <div className="bg-[#111827] p-6 rounded-xl">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">📈 Price Trend</h3>

        {/* Filters */}
        <div className="flex gap-2">
          {["1W", "1M"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-sm ${
                range === r
                  ? "bg-indigo-600"
                  : "bg-[#1F2937] text-gray-400"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData[range]}>
            <XAxis dataKey="day" stroke="#9CA3AF" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#22c55e"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}