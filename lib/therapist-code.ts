import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Generate a 6-digit therapist code that is not already in use.
 * Falls back to an 8-digit code if it can't find a free 6-digit one.
 */
export async function generateUniqueTherapistCode(
  supabase: SupabaseClient
): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const { data } = await supabase
      .from("therapists")
      .select("id")
      .eq("therapist_code", code)
      .maybeSingle();
    if (!data) return code;
  }
  // Fallback: 8-digit code to reduce collision chance
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}
