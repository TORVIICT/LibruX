import {supabase} from '../lib/supabase';

export async function login(email: string, password: string) {
  const {data, error} = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  return {data, error};
}

export async function register(name: string, email: string, password: string) {
  const {data, error} = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        name,
      },
    },
  });

  return {data, error};
}