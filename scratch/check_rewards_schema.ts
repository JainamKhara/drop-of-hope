import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRewardsSchema() {
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error fetching rewards:", error);
  } else {
    console.log("Rewards columns:", Object.keys(data[0] || {}));
  }
}

checkRewardsSchema();
