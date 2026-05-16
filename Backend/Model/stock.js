const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
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