const puppeteer = require("puppeteer");

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: "URL parameter is required" });

  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

    await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });

    const html = await page.content();
    await browser.close();

    res.status(200).json({ url, renderedHtml: html });
  } catch (error) {
    res.status(500).json({ error: "Failed to render page", details: error.message });
  }
};