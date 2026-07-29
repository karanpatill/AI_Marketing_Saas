const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('assets').insert({
    workspace_id: 'some-id',
    project_id: null,
    job_id: 'some-id',
    type: 'image',
    url: 'generated',
    metadata_json: { test: 'test' }
  });
  console.log(error);
}
test();
