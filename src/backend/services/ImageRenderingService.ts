import * as cheerio from 'cheerio';

export class ImageRenderingService {
  static async renderHtmlToBase64(html: string, width = 1080, height = 1080): Promise<string> {
    try {
      // Temporary Vercel Fallback: Extract the Unsplash image directly from HTML 
      // instead of using heavy Puppeteer which crashes on Vercel Serverless limits.
      const $ = cheerio.load(html);
      let imgUrl = $('img').first().attr('src');
      
      if (!imgUrl) {
        // Try to find background-image in inline styles if no <img> tag exists
        const elementsWithStyle = $('[style]');
        elementsWithStyle.each((_, el) => {
          const style = $(el).attr('style') || '';
          const bgMatch = style.match(/background-image:\s*url\(['"]?(.*?)['"]?\)/i);
          if (bgMatch && bgMatch[1]) {
            imgUrl = bgMatch[1];
            return false; // break loop
          }
        });
      }

      if (imgUrl) {
        const imageResponse = await fetch(imgUrl);
        const arrayBuffer = await imageResponse.arrayBuffer();
        return Buffer.from(arrayBuffer).toString('base64');
      }

      // If absolutely no image found in the HTML, return a generic placeholder so the pipeline doesn't crash
      const fallbackResponse = await fetch(`https://dummyimage.com/${width}x${height}/000000/ffffff&text=Cloud+Render+Pending`);
      const fallbackBuffer = await fallbackResponse.arrayBuffer();
      return Buffer.from(fallbackBuffer).toString('base64');
    } catch (e) {
      console.error("Vercel rendering fallback failed:", e);
      throw e;
    }
  }
}
