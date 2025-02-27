import { createClient } from '@supabase/supabase-js';

console.log('Loading Supabase environment variables...');
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY length:', SUPABASE_ANON_KEY?.length);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing environment variables:', {
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_ANON_KEY
  });
  throw new Error('Missing Supabase environment variables');
}

console.log('Initializing Supabase client...');
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

export const getAccessToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Current session:', session);
  return session?.access_token;
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('Attempting to sign in with email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    console.log('Sign in successful:', data);
    const session = await supabase.auth.getSession();
    console.log('Current session after sign in:', session);

    return data;
  } catch (error) {
    console.error('Unexpected error during sign in:', error);
    throw error;
  }
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};
