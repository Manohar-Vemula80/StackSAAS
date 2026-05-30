const express = require("express");
const router = express.Router();
const Stock = require("../Model/stock");

router.get("/", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const data = await Stock.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

module.exports = router;