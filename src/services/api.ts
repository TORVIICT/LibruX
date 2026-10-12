import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export async function fetchWithAuth<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // 1. Obtener sesión y token JWT actual desde Supabase
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const responseData = await response.json();

  if (!response.ok || responseData.success === false) {
    const errorMessage =
      responseData.error?.message ||
      responseData.message ||
      `HTTP Error ${response.status}`;
    throw new Error(errorMessage);
  }

  return responseData;
}
