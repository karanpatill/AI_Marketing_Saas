
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from("brand_dna").select("id, brand_name");
  if (error) { console.log(error); return; }
  const asenraList = data.filter(b => (b.brand_name || "").toLowerCase().includes("asenra"));
  
  for (const asenra of asenraList) {
    const { error: updateError } = await supabase
      .from("brand_dna")
      .update({ internal_design_language: "Retro" })
      .eq("id", asenra.id);
    if (updateError) {
      console.error("Error updating", asenra.id, updateError);
    } else {
      console.log("Updated", asenra.id);
    }
  }
}
run();

