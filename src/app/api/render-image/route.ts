import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: Request) {
  let browser;
  try {
    const { html, width = 1080, height = 1080 } = await request.json();

    if (!html) {
      return NextResponse.json({ error: "Missing html" }, { status: 400 });
    }

    // Build a full HTML page with Tailwind CDN for perfect class support
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
    await page.setContent(fullHtml, { waitUntil: "networkidle0", timeout: 15000 });

    // Wait for fonts and images to fully load
    await page.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 800));

    const screenshot = await page.screenshot({
      type: "jpeg",
      quality: 95,
      clip: { x: 0, y: 0, width, height },
    });

    const base64 = `data:image/jpeg;base64,${Buffer.from(screenshot).toString("base64")}`;

    return NextResponse.json({ imageBase64: base64 });
  } catch (err: any) {
    console.error("[Render Image Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to render image" },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
