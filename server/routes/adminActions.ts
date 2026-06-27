import { Request, Response } from "express";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration.");
    }
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabase;
}

/**
 * POST /api/admin/donors/:id/approve
 * Approves a donor by setting is_verified to true
 */
export const handleApproveDonor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[AdminAction] Approving donor: ${id}`);

    const { data, error } = await getSupabase()
      .from("donors")
      .update({
        is_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`[AdminAction] Supabase error approving donor ${id}:`, error);
      return res.status(500).json({ error: error.message, details: error });
    }


    if (!data) {
      return res.status(404).json({ error: "Donor not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Donor approved successfully",
      data,
    });
  } catch (error) {
    console.error("Internal error in handleApproveDonor:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
