import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kplxehejsrxziubmtcjy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwbHhlaGVqc3J4eml1Ym10Y2p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTU3MjAsImV4cCI6MjA5NzM3MTcyMH0.pEZggq2CJX_Kp04gUvGKfsJVQBLLcy7m4M5EoN5GtSo'

export const supabase = createClient(supabaseUrl, supabaseKey)
