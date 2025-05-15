import {createClient} from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hxyftzsadtarnmobdkdh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4eWZ0enNhZHRhcm5tb2Jka2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMDc5MDIsImV4cCI6MjA2Mjg4MzkwMn0.9F79a0MpmbhCuk6-6mtvqa3Cw-ifizxPPorqrjkRkng';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
        'Supabase URL ou chave não estão configurados corretamente!'
    );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);