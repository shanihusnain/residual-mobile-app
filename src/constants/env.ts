/**
 * Expo public env (bundled into the app).
 * Set values in `.env` — see `.env.example`.
 */
export const ENV = {
  supabaseUrl:
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    "https://ejrydnufobdswmplcvri.supabase.co",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
} as const;

export function assertAuthConfig() {
  if (!ENV.supabaseAnonKey) {
    throw new Error(
      "Missing EXPO_PUBLIC_SUPABASE_ANON_KEY. Add it to your .env file.",
    );
  }
}
