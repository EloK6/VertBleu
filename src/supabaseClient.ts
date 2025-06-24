import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://awfizgzejvmqxwonebsy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3Zml6Z3planZtcXh3b25lYnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODQxMjksImV4cCI6MjA2NjM2MDEyOX0.3R-H1oP14AmCdDPPc-AL8jgkB5C3oOE5WOLn2D39F_M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 