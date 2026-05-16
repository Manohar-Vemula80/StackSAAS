const express = require("express");
const router = express.Router();
const Stock = require("../Model/stock");

router.get("/", async (req, res) => {
  try {
    const data = await Stock.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

module.exports = router;