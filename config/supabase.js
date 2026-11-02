import { createClient } from '@supabase/supabase-js';
import { config } from './environment.js';

let supabaseClient = null;
let supabaseAdminClient = null;

function cleanUrl(url) {
  if (!url) return '';
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export function isSupabaseConfigured() {
  const url = cleanUrl(config.supabaseUrl);
  const key = config.supabaseKey;
  return Boolean(
    url && 
    key && 
    typeof url === 'string' && 
    url.startsWith('http') && 
    !url.includes('your-project-id')
  );
}

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  if (isSupabaseConfigured()) {
    try {
      const url = cleanUrl(config.supabaseUrl);
      supabaseClient = createClient(url, config.supabaseKey.trim(), {
        auth: {
          persistSession: false,
          autoRefreshToken: true,
        },
      });
      return supabaseClient;
    } catch (err) {
      console.warn('⚠️ Failed to initialize Supabase client:', err.message);
      return null;
    }
  }

  return null;
}

export function getSupabaseAdminClient() {
  if (supabaseAdminClient) return supabaseAdminClient;

  const url = cleanUrl(config.supabaseUrl);
  const key = config.supabaseServiceRoleKey || config.supabaseKey;

  if (url && key && url.startsWith('http') && !url.includes('your-project-id')) {
    try {
      supabaseAdminClient = createClient(url, key.trim(), {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      return supabaseAdminClient;
    } catch (err) {
      console.warn('⚠️ Failed to initialize Supabase admin client:', err.message);
      return null;
    }
  }

  return getSupabaseClient();
}

export const supabase = getSupabaseClient();

