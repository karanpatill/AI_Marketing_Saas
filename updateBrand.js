
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from("brand_dna").select("*");
  if (error) {
    console.error("Error fetching brand_dna:", error);
    return;
  }
  
  const asenra = data.find(b => (b.brand_name || "").toLowerCase().includes("asenra") || (b.name || "").toLowerCase().includes("asenra"));
  if (asenra) {
    console.log("Found Asenra:", asenra.id);
    
    const { error: updateError } = await supabase
      .from("brand_dna")
      .update({ internal_design_language: "Swiss Style" })
      .eq("id", asenra.id);
      
    if (updateError) {
      console.error("Error updating:", updateError);
    } else {
      console.log("Updated Asenra to Swiss Style successfully.");
    }
  } else {
    console.log("Asenra not found in brand_dna. Existing brands:");
    console.log(data.map(d => d.brand_name || d.name));
  }
}
run();

