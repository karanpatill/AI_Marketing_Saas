import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf-8');
const lines = env.split('\n');
const processEnv = {};
for (const line of lines) {
  if (line.includes('=')) {
    const [key, ...val] = line.split('=');
    processEnv[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
  }
}
const supabase = createClient(processEnv.NEXT_PUBLIC_SUPABASE_URL, processEnv.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('assets').insert({
    workspace_id: '00000000-0000-0000-0000-000000000000'
  });
  console.log('Result:', error || 'Success!');
}
test();
