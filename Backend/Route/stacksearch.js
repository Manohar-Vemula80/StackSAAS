const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  const query = req.query.query;

  if (!query) return res.json([]);

  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/search?q=${query}&token=${process.env.FINNHUB_API_KEY}`
    );

    const result = response.data.result.map((item) => ({
      symbol: item.symbol,
      name: item.description,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

module.exports = router;