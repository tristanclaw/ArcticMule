const { chromium } = require('/home/munky/playwright-browser/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/munky/.cache/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-linux64/chrome-headless-shell',
    headless: true
  });
  const page = await browser.newPage();
  
  const url = 'https://gemini.google.com/share/d7fcc07a9c78';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Wait a bit for JS to render
  await page.waitForTimeout(5000);
  
  const images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt,
      width: img.width,
      height: img.height
    }));
  });
  
  console.log('Found images:', JSON.stringify(images, null, 2));
  
  await browser.close();
})();
