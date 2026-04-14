import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xwamazrfpegephjebhwb.supabase.co'
const supabaseAnonKey = 'sb_publishable_tMGzfdIg6kwdPDXJgQv7FQ_RXm8USr0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)