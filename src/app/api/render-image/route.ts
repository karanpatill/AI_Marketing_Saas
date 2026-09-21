import { NextRequest, NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer";
import { z } from "zod";
import { withApiWrapper } from "@/backend/middlewares/apiWrapper";
import { requireAuth } from "@/backend/middlewares/auth";
import { isPrivateAddress } from "@/backend/utils/urlSafety";
import { logger } from "@/backend/utils/logger";

export const maxDuration = 30;

const bodySchema = z.object({
  html: z.string().min(1).max(512 * 1024),
  width: z.number().int().min(100).max(2160).default(1080),
  height: z.number().int().min(100).max(2160).default(1080),
});

/** Only allow the sandboxed page to load public http(s) subresources (fonts, images, Tailwind CDN). */
function isAllowedSubresource(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "data:") return true;
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return false;
    if (/^[\d.]+$|:/.test(host) && isPrivateAddress(host.replace(/^\[|\]$/g, ""))) return false;
    return true;
  } catch {
    return false;
  }
}

export const POST = withApiWrapper(async (request: NextRequest) => {
  await requireAuth();
  const { html, width, height } = bodySchema.parse(await request.json());

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

  let browser: Browser | undefined;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (isAllowedSubresource(req.url())) req.continue();
      else req.abort();
    });

    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.setContent(fullHtml, { waitUntil: "load", timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 800));

    const screenshot = await page.screenshot({
      type: "jpeg",
      quality: 95,
      clip: { x: 0, y: 0, width, height },
    });

    return NextResponse.json({ imageBase64: `data:image/jpeg;base64,${Buffer.from(screenshot).toString("base64")}` });
  } catch (err) {
    logger.error({ err }, "Render image failed");
    return NextResponse.json({ error: "Failed to render image" }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
});
