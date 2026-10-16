import { createClient } from "@supabase/supabase-js";
import { validateSupabaseConfig } from "./supabase-config.js";

const { supabaseUrl, supabaseAnonKey } = validateSupabaseConfig(import.meta.env);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
