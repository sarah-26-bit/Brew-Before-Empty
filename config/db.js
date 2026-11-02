import { isSupabaseConfigured, getSupabaseClient } from './supabase.js';
import { config } from './environment.js';

export async function connectDB() {
  if (isSupabaseConfigured()) {
    try {
      console.log(`🔮 Connecting to Supabase project at ${config.supabaseUrl}...`);
      const supabase = getSupabaseClient();
      
      // Perform a ping check against Supabase
      const { data, error } = await supabase
        .from('ingredients')
        .select('id')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        // If table does not exist yet, it's connected but needs schema
        if (error.message && error.message.includes('relation "public.ingredients" does not exist')) {
          console.warn('⚠️ Connected to Supabase, but "ingredients" table is not created yet. Please execute supabase-schema.sql in your Supabase SQL Editor.');
        } else {
          console.warn(`⚠️ Supabase connection warning: ${error.message}`);
        }
      } else {
        console.log('✨ Successfully connected to Supabase PostgreSQL Database!');
      }

      return supabase;
    } catch (err) {
      console.warn(`⚠️ Supabase connection check encountered an error (${err.message}). Using local alchemical cache.`);
    }
  } else {
    console.log('⚡ Supabase database mode active.');
    console.log('ℹ️  Add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file to link your cloud Supabase database.');
  }

  return null;
}

export async function disconnectDB() {
  // Supabase uses connection pooling over HTTPS/REST, no persistent TCP disconnect needed
  return true;
}
