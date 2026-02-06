const { chromium } = require('/home/munky/playwright-browser/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/munky/.cache/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-linux64/chrome-headless-shell',
    headless: true
  });
  const page = await browser.newPage();
  await page.goto('https://gemini.google.com/share/d7fcc07a9c78', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'debug_screenshot.png' });
  await browser.close();
})();
