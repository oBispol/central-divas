import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xtpwioctpkgtnbriuqop.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0cHdpb2N0cGtndG5icml1cW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTM0MDQsImV4cCI6MjA4OTYyOTQwNH0.p_L-pIpjCpttSOf0FZuMRG84pVY226Upnc4mTzIZfsA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
