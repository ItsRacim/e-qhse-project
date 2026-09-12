import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Initialize Supabase client with environment variables
// These are loaded via dotenv/config in prisma.config.ts
export const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);