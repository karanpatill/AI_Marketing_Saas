
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from("brand_dna").select("*");
  const asenra = data.find(b => (b.brand_name || "").toLowerCase().includes("asenra") || (b.name || "").toLowerCase().includes("asenra"));
  console.log(asenra);
}
run();

