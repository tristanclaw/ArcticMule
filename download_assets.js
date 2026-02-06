const { chromium } = require('/home/munky/playwright-browser/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

const links = [
    { url: 'https://gemini.google.com/share/d7fcc07a9c78', name: 'hero.jpg' },
    { url: 'https://gemini.google.com/share/6e758d3a0d56', name: 'power-pallet.jpg' },
    { url: 'https://gemini.google.com/share/fe4bb131e426', name: 'sodium-ion.jpg' },
    { url: 'https://gemini.google.com/share/e7863f32f4d5', name: 'gravel-landing.jpg' }
];

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
};

(async () => {
    const browser = await chromium.launch({
        executablePath: '/home/munky/.cache/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-linux64/chrome-headless-shell',
        headless: true
    });
    
    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

    for (const item of links) {
        console.log(`Processing ${item.url}...`);
        const page = await browser.newPage();
        try {
            await page.goto(item.url, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(5000); // Wait for dynamic rendering

            // Find the generated image. In Gemini shares, it's usually a large img inside a specific container
            // We'll look for the largest image by area
            const imgUrl = await page.evaluate(() => {
                const imgs = Array.from(document.querySelectorAll('img'));
                // Filter out icons, avatars (usually small)
                const candidates = imgs.filter(img => img.width > 300 && img.height > 300);
                if (candidates.length === 0) return null;
                
                // Sort by area descending
                candidates.sort((a, b) => (b.width * b.height) - (a.width * a.height));
                return candidates[0].src;
            });

            if (imgUrl) {
                console.log(`Found image URL: ${imgUrl}`);
                await downloadImage(imgUrl, path.join(assetsDir, item.name));
                console.log(`Saved to assets/${item.name}`);
            } else {
                console.error(`No suitable image found for ${item.url}`);
            }
        } catch (e) {
            console.error(`Error processing ${item.url}:`, e);
        }
        await page.close();
    }

    await browser.close();
})();
