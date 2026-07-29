import { NextResponse } from 'next/server';
import { ModelRegistry } from '@/backend/ai/utils/ModelRegistry';

export async function GET() {
  try {
    const models = ModelRegistry.getModelsWithStatus();
    return NextResponse.json({ models });
  } catch (error) {
    console.error('[API] Error fetching models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}
