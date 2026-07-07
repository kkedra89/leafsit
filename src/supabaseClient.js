import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ayfunneorclmhkmvpwti.supabase.co'
const supabaseKey = 'sb_publishable_ZEs_2D4fBqHhCuSijk1PBw_H0-ft7u5'

export const supabase = createClient(supabaseUrl, supabaseKey)