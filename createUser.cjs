const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://kplxehejsrxziubmtcjy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwbHhlaGVqc3J4eml1Ym10Y2p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTU3MjAsImV4cCI6MjA5NzM3MTcyMH0.pEZggq2CJX_Kp04gUvGKfsJVQBLLcy7m4M5EoN5GtSo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function signUp() {
  const { data, error } = await supabase.auth.signUp({
    email: 'patankarabhishek126@gmail.com',
    password: 'admin321',
  });
  if (error) console.error('Error:', error.message);
  else console.log('User created:', data.user?.id);
}
signUp();
