import { NextResponse, NextRequest } from 'next/server';
import { requireAuth } from '@/backend/middlewares/auth';
import { createAdminClient } from '@/lib/supabaseServer';
import { GenerationJobRepository } from '@/backend/repositories/GenerationJobRepository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing job ID' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const jobRepo = new GenerationJobRepository(supabaseAdmin);

    const job = await jobRepo.getJob(id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Optional: add authorization check to ensure the user requesting the job is the one who created it
    if (job.user_id !== user.id) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ job }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to fetch job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
