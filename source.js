const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cors = require("cors");
const fs = require("fs");

// Enable stealth mode
puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
];

app.get("/api/source", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
        // Launch Puppeteer with advanced options
        const browser = await puppeteer.launch({
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-infobars",
                "--window-size=1920,1080",
                "--hide-scrollbars",
                "--enable-features=NetworkService,NetworkServiceInProcess",
                "--disable-features=IsolateOrigins,site-per-process",
                "--disable-gpu"
            ],
            headless: "new"
        });

        const page = await browser.newPage();
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        await page.setUserAgent(userAgent);

        // Modify browser properties to evade bot detection
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, "webdriver", { get: () => false });
            Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
            Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
            Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });

            // Block bot-detecting scripts
            window.navigator.permissions.query = (parameters) =>
                parameters.name === "notifications" 
                    ? Promise.resolve({ state: "denied" }) 
                    : Promise.resolve({ state: "granted" });

            window.navigator.webdriver = undefined;
            window.chrome = { runtime: {} };
            window.screenX = Math.floor(Math.random() * 100);
            window.screenY = Math.floor(Math.random() * 100);

            // WebRTC Spoofing
            Object.defineProperty(navigator, "userAgentData", {
                get: () => ({
                    brands: [{ brand: "Chromium", version: "120" }],
                    platform: "Windows"
                })
            });

            // Prevent iframe detection
            const originalGetAttribute = Element.prototype.getAttribute;
            Element.prototype.getAttribute = function (name) {
                if (name === "src" && this.tagName === "IFRAME") {
                    return "";
                }
                return originalGetAttribute.apply(this, arguments);
            };
        });

        // Intercept bot detection scripts and block them
        await page.setRequestInterception(true);
        page.on("request", (req) => {
            const url = req.url();
            if (
                url.includes("analytics") ||
                url.includes("tracker") ||
                url.includes("bot-detect") ||
                url.includes("fingerprint")
            ) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Visit the website
        await page.goto(url, { waitUntil: "networkidle2" });

        // Extract HTML source code
        const html = await page.content();
        await browser.close();

        res.json({ url, html });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch website: " + error.message });
    }
});

module.exports = app;
