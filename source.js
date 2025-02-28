const axios = require("axios");

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: "URL parameter is required" });

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 15000, // 15s timeout
    });

    res.status(200).json({
      url,
      html: response.data, // Full page source
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch source", details: error.message });
  }
};