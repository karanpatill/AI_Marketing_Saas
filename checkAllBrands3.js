
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from("brand_dna").select("id, brand_name, internal_design_language");
  if (error) console.log(error);
  if (data) {
    const asenra = data.filter(b => (b.brand_name || "").toLowerCase().includes("asenra") || (b.name || "").toLowerCase().includes("asenra"));
    console.dir(asenra);
  }
}
run();

