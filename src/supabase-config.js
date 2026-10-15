export function validateSupabaseConfig(env = {}) {
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
  if (typeof supabaseUrl !== "string" || !supabaseUrl.trim()) {
    throw new Error("VITE_SUPABASE_URL es obligatoria y debe ser una URL HTTP(S) válida.");
  }
  try {
    const url = new URL(supabaseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  } catch {
    throw new Error("VITE_SUPABASE_URL debe ser una URL HTTP(S) válida.");
  }
  if (typeof supabaseAnonKey !== "string" || !supabaseAnonKey.trim()) {
    throw new Error("VITE_SUPABASE_ANON_KEY es obligatoria.");
  }
  return { supabaseUrl, supabaseAnonKey };
}
