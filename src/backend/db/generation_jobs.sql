-- Table: generation_jobs
-- Used to track background AI generation tasks handled by Upstash QStash

CREATE TABLE IF NOT EXISTS generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    job_type TEXT NOT NULL, -- e.g., 'generate_post', 'generate_calendar_content'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    payload JSONB NOT NULL DEFAULT '{}'::jsonb, -- The input data
    result JSONB, -- The generated output data
    error TEXT, -- Error message if failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying jobs by user or org quickly
CREATE INDEX IF NOT EXISTS idx_generation_jobs_org_id ON generation_jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_user_id ON generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON generation_jobs(status);
