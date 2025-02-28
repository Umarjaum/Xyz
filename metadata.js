const axios = require("axios");
const { JSDOM } = require("jsdom");

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: "URL parameter is required" });

  try {
    const response = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const dom = new JSDOM(response.data);
    const doc = dom.window.document;

    res.status(200).json({
      title: doc.querySelector("title")?.textContent || "No title found",
      description: doc.querySelector('meta[name="description"]')?.content || "No description found",
      keywords: doc.querySelector('meta[name="keywords"]')?.content || "No keywords found",
      ogTitle: doc.querySelector('meta[property="og:title"]')?.content || "No OpenGraph title",
      ogImage: doc.querySelector('meta[property="og:image"]')?.content || "No OpenGraph image",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch metadata", details: error.message });
  }
};