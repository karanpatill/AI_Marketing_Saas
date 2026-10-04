import puppeteer from 'puppeteer';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

// We define the strict schema for the Design System we want Claude to return.
const DesignSystemSchema = z.object({
  brand_name: z.string().describe("The name of the brand"),
  colors: z.object({
    primary: z.string().describe("The dominant brand color (hex)"),
    secondary: z.string().describe("The secondary brand color (hex)"),
    accent: z.string().describe("An accent color for CTAs or highlights (hex)"),
    background: z.string().describe("The primary background color (hex)"),
    text: z.string().describe("The primary text color (hex)")
  }),
  typography: z.object({
    heading_font: z.string().describe("The font family used for major headings"),
    body_font: z.string().describe("The font family used for paragraphs and body text"),
    letter_spacing: z.enum(['tight', 'normal', 'wide']).describe("General letter spacing vibe")
  }),
  ui_elements: z.object({
    button_style: z.enum(['sharp', 'rounded', 'pill']).describe("How buttons are shaped"),
    shadows: z.enum(['none', 'soft', 'hard']).describe("What kind of drop shadows are used"),
    vibe: z.string().describe("A 3-5 word description of the brand's aesthetic (e.g., 'premium, minimalist, energetic')")
  })
});

export type BrandDesignSystem = z.infer<typeof DesignSystemSchema>;

export class BrandExtractor {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  /**
   * Orchestrates the full extraction: Puppeteer Scrape -> Claude Vision -> JSON
   */
  async extractDesignSystem(url: string): Promise<BrandDesignSystem> {
    console.log(`[BrandExtractor] Launching headless browser for ${url}...`);
    
    // 1. Launch Puppeteer
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1080 }); // Desktop viewport
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // 2. Take a screenshot of the homepage
      console.log(`[BrandExtractor] Taking screenshot...`);
      const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 80, fullPage: true });
      const base64Image = Buffer.from(screenshotBuffer).toString('base64');
      
      // 3. Extract CSS Rules (Fonts & Colors)
      console.log(`[BrandExtractor] Extracting computed CSS...`);
      const cssData = await page.evaluate(() => {
        // A simple script to find the most common fonts and colors in the document
        const elements = document.querySelectorAll('h1, h2, h3, p, button, a');
        const fonts = new Set<string>();
        const colors = new Set<string>();
        const bgColors = new Set<string>();
        
        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          fonts.add(style.fontFamily);
          colors.add(style.color);
          bgColors.add(style.backgroundColor);
        });
        
        return {
          fonts: Array.from(fonts).slice(0, 5),
          colors: Array.from(colors).slice(0, 5),
          bgColors: Array.from(bgColors).slice(0, 5),
        };
      });

      await browser.close();

      // 4. Send to Claude 3.5 Sonnet (Vision)
      console.log(`[BrandExtractor] Sending to Claude 3.5 Sonnet...`);
      
      const prompt = `
        You are a world-class Art Director and UX Designer. 
        Analyze this D2C website screenshot and the raw CSS data below.
        
        Raw CSS Data Extracted:
        ${JSON.stringify(cssData, null, 2)}
        
        Extract the brand's complete Design System. Pay close attention to the vibe, the exact hex colors used for primary actions, the font families, and the shape of the buttons.
        Output ONLY a strict JSON object that perfectly matches this schema structure. Do not wrap in markdown blocks, just return raw JSON:
        {
          "brand_name": "string",
          "colors": {
            "primary": "hex string",
            "secondary": "hex string",
            "accent": "hex string",
            "background": "hex string",
            "text": "hex string"
          },
          "typography": {
            "heading_font": "string",
            "body_font": "string",
            "letter_spacing": "tight | normal | wide"
          },
          "ui_elements": {
            "button_style": "sharp | rounded | pill",
            "shadows": "none | soft | hard",
            "vibe": "string"
          }
        }
      `;

      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64Image,
                }
              },
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ]
      });

      // 5. Parse the JSON Output
      const textResponse = (response.content[0] as any).text;
      
      // Attempt to clean the output if Claude wrapped it in markdown
      let jsonString = textResponse;
      if (jsonString.includes('```json')) {
        jsonString = jsonString.split('```json')[1].split('```')[0].trim();
      } else if (jsonString.includes('```')) {
        jsonString = jsonString.split('```')[1].split('```')[0].trim();
      }

      const designSystem = JSON.parse(jsonString) as BrandDesignSystem;
      console.log(`[BrandExtractor] Extraction Complete!`, designSystem);
      
      return designSystem;

    } catch (error) {
      console.error(`[BrandExtractor] Error:`, error);
      if (browser) await browser.close();
      throw error;
    }
  }
}
