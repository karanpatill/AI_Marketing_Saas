
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: brand } = await supabase.from("brand_dna").select("*").eq("id", "ddc87549-9703-4bfc-b468-1251db27d270").single();
  console.log("Brand:", brand.internal_design_language);
}
run();

