
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: brands, error } = await supabase.from("brand_dna").select("*");
    if (error) {
        console.error("Error fetching brands:", error);
        return;
    }
    
    if (!brands || brands.length === 0) {
        console.log("No brands found.");
        return;
    }
    
    for (const brand of brands) {
        console.log(`\nBrand: ${brand.name || brand.id} (Workspace ID: ${brand.workspace_id})`);
        
        console.log(JSON.stringify(brand, null, 2));
    }
}

main();

