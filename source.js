const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cors = require("cors");

// Enable Puppeteer stealth mode
puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
];

app.get("/api/source", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
        // Use a Puppeteer provider for Vercel (pre-installed)
        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: "new"
        });

        const page = await browser.newPage();
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        await page.setUserAgent(userAgent);

        // Bypass bot detection
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, "webdriver", { get: () => false });
        });

        // Block heavy analytics scripts to speed up loading
        await page.setRequestInterception(true);
        page.on("request", (req) => {
            if (req.url().includes("analytics") || req.url().includes("bot-detect")) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Open the URL
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });

        // Get HTML content
        const html = await page.content();
        await browser.close();

        res.json({ success: true, url, html });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch source code", details: error.message });
    }
});

module.exports = app;
