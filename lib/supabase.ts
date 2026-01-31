
import { createClient } from '@supabase/supabase-js';

// Access environment variables for Vite with safety check
// We cast import.meta to any to avoid TypeScript errors if types aren't fully set up
const meta = import.meta as any;
const env = meta.env || {};

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
