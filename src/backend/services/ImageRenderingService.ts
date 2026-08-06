import puppeteer from "puppeteer";

export class ImageRenderingService {
  static async renderHtmlToBase64(html: string, width = 1080, height = 1080): Promise<string> {
    let browser;
    try {
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { margin: 0; padding: 0; width: ${width}px; height: ${height}px; overflow: hidden; }
  </style>
</head>
<body>
  <div style="width: ${width}px; height: ${height}px; overflow: hidden; position: relative;">
    ${html}
  </div>
</body>
</html>`;

      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      });

      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      await page.setContent(fullHtml, { waitUntil: "load", timeout: 15000 });

      // Wait for fonts and images to fully load
      await page.evaluate(() => document.fonts.ready);
      await new Promise((r) => setTimeout(r, 800));

      const screenshot = await page.screenshot({
        type: "jpeg",
        quality: 95,
        clip: { x: 0, y: 0, width, height },
      });

      return Buffer.from(screenshot).toString("base64");
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
