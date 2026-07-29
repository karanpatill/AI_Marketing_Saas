
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Fetching brands...");
    const { data: brands, error } = await supabase.from("brands").select("*");
    if (error) {
        console.error("Error fetching brands:", error);
        return;
    }
    
    if (!brands || brands.length === 0) {
        console.log("No brands found.");
        return;
    }
    
    for (const brand of brands) {
        console.log(`\nBrand: ${brand.name} (ID: ${brand.id})`);
        console.log(`Design Language / Personality: ${brand.personality || brand.design_language || JSON.stringify(brand)}`);
    }
}

main();

