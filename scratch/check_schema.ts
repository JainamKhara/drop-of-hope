import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error fetching appointments:", error);
  } else {
    console.log("Appointment columns:", Object.keys(data[0] || {}));
  }

  // Check enum values if possible (this might not work via JS)
  const { data: enumData, error: enumError } = await supabase.rpc('get_enum_values', { enum_name: 'appointment_status' });
  if (enumError) {
    console.log("Could not fetch enum values via RPC (expected if function missing)");
  } else {
    console.log("Enum values:", enumData);
  }
}

checkSchema();
