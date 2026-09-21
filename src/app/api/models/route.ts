import { NextResponse } from 'next/server';
import { requireAuth } from '@/backend/middlewares/auth';
import { ModelRegistry } from '@/backend/ai/utils/ModelRegistry';

export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const models = ModelRegistry.getModelsWithStatus();
    return NextResponse.json({ models });
  } catch (error) {
    console.error('[API] Error fetching models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}
