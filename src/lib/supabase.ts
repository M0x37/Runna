import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder');

export const isSupabaseConfigured = Boolean(url && anonKey);