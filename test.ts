import { createClient } from '@supabase/supabase-js';
import { determineDesignLanguage } from './src/backend/ai/utils/styleProfiles';

const supabase = createClient(
  'https://zjbdojuoktejikcdypcn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqYmRvanVva3RlamlrY2R5cGNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzQzNzU1MiwiZXhwIjoyMDk5MDEzNTUyfQ.LnJCzYZwKPFbcIKuSe9dJLDkHXTzkJ355WEBIiJVuCc'
);

async function check() {
  const { data, error } = await supabase
    .from('brand_dna')
    .select('brand_name, brand_personality, business_description')
    .ilike('brand_name', '%asenra%')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching:', error);
    process.exit(1);
  }

  const lang = determineDesignLanguage(data.brand_personality || '', data.business_description || '');
  console.log('--- Result ---');
  console.log('Brand Name:', data.brand_name);
  console.log('Personality:', data.brand_personality);
  console.log('Description:', data.business_description);
  console.log('Design Language:', lang);
}

check();
