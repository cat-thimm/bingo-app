import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isConfigured = Boolean(url && key);

// Platzhalter, damit die App ohne .env nicht beim Start abstürzt;
// App.tsx zeigt dann einen Hinweis statt der Oberfläche.
export const supabase = createClient(url ?? 'http://localhost', key ?? 'missing');
