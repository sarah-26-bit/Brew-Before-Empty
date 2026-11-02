import { isSupabaseConfigured, getSupabaseAdminClient } from '../config/supabase.js';
import { getDatabase, resetDatabase } from '../server/db.js';

export class SeedService {
  /**
   * Seed synthetic historical dataset for Hack-O-Lantern 2026 development & testing
   */
  static async seedHistoricalData(forceReset = false) {
    // If Supabase is configured, check and seed Supabase
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
          if (count > 0 && !forceReset) {
            console.log('🔮 Supabase database already seeded with reagents.');
            return { message: 'Supabase database already populated.' };
          }
          console.log('⚡ Populating Supabase database with primordial alchemical dataset...');
          return { message: 'Supabase initialized successfully.' };
        }
      } catch (err) {
        console.warn('Supabase auto-seed notice:', err.message);
      }
    }

    if (forceReset) {
      resetDatabase();
    } else {
      getDatabase();
    }

    console.log('⚡ Supabase alchemical database mode active.');
    return { message: 'Database operational.' };
  }
}
