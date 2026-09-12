// Validate environment variables to prevent runtime crashes during local dev
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase credentials are configured
let supabaseInitialized = false;

if (supabaseUrl && supabaseAnonKey) {
  supabaseInitialized = true;
}

// Initialize Supabase client only if credentials exist
export const supabase = (() => {
  if (!supabaseInitialized) {
    // Return a mock client that will fail gracefully with clear errors
    // This prevents blank screens when credentials are missing locally
    const mockSupabase = createClient(
      supabaseUrl || "https://example.supabase.co",
      supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ExampleKey"
    );

    // Override auth methods to throw clear errors
    ;(mockSupabase.auth as Record<string, unknown>).signInWithPassword = async () => {
      throw new Error(
        "Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env file."
      );
    };
    ;(mockSupabase.auth as Record<string, unknown>).signUp = async () => {
      throw new Error(
        "Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env file."
      );
    };
    ;(mockSupabase.auth as Record<string, unknown>).getSession = async () => ({
      data: { session: null },
      error: null,
    });

    return mockSupabase as ReturnType<typeof createClient>;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
})();