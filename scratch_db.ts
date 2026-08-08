import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDb() {
  const { data: jobs, error: jobErr } = await supabase
    .from('jobs')
    .select('id, status, error, output_reference, created_at, job_type')
    .order('created_at', { ascending: false })
    .limit(3);
  
  if (jobErr) console.error("Job error:", jobErr);
  else console.log(jobs);
}

checkDb();
