import { NextResponse } from 'next/server';
import { BrandExtractor } from '@/backend/ai/BrandExtractor';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Initialize the Extractor
    const extractor = new BrandExtractor();
    
    // Call the extraction logic (Puppeteer + Claude Vision)
    const designSystem = await extractor.extractDesignSystem(url);

    return NextResponse.json(
      { 
        success: true, 
        designSystem 
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('[API] Error extracting Brand DNA:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract Brand DNA' },
      { status: 500 }
    );
  }
}
