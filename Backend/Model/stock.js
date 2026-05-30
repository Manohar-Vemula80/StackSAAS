const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  symbol: String,
  recommendation: String,
  price: Number,
  score: Number, // ✅ ADD THIS
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Stock", stockSchema);