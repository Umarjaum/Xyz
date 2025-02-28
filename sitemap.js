const axios = require("axios");

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: "URL parameter is required" });

  try {
    const sitemapUrl = url.endsWith("/") ? `${url}sitemap.xml` : `${url}/sitemap.xml`;
    const robotsUrl = url.endsWith("/") ? `${url}robots.txt` : `${url}/robots.txt`;

    const sitemapResponse = await axios.get(sitemapUrl);
    const robotsResponse = await axios.get(robotsUrl);

    res.status(200).json({
      url,
      sitemap: sitemapResponse.data || "No sitemap found",
      robots: robotsResponse.data || "No robots.txt found",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sitemap", details: error.message });
  }
};