import * as fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
for (const line of env.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
}
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);
async function run() {
  const { data } = await supabase.rpc('exec_sql', { sql: `
    SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'campaigns';
  ` });
  console.log('campaigns columns:', data);
  const { error } = await supabase.rpc('exec_sql', { sql: `
    BEGIN;
    DROP PUBLICATION IF EXISTS supabase_realtime;
    CREATE PUBLICATION supabase_realtime FOR TABLE jobs, workspaces, projects, brand_dna, brand_assets;
    COMMIT;
  ` });
  console.log('Realtime err:', error);
}
run();
