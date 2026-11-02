import { getSupabaseAdminClient, isSupabaseConfigured } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const initialDataPath = path.join(__dirname, '..', 'server', 'data', 'initialData.json');

async function createSampleUser() {
  console.log('⚡ Attuning to Supabase Cloud Instance...');

  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase credentials are missing or invalid in .env');
    process.exit(1);
  }

  const supabase = getSupabaseAdminClient();
  const sampleEmail = 'kunjatadevu2008@gmail.com';
  const sampleName = 'Deva';
  const samplePassword = 'Password123!';
  const sampleRole = 'Grand Magister Cynthia (Lead Alchemist)';

  try {
    console.log(`👤 Checking user ${sampleEmail} in Supabase Auth...`);

    // Check if user already exists
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    let user = usersData?.users?.find(u => u.email === sampleEmail);

    if (user) {
      console.log(`✓ User ${sampleEmail} exists (ID: ${user.id}). Updating password and metadata...`);
      const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: samplePassword,
        user_metadata: {
          full_name: sampleName,
          role: sampleRole,
        },
        email_confirm: true,
      });

      if (updateError) throw updateError;
      user = updated.user;
    } else {
      console.log(`✨ Creating user ${sampleEmail} in Supabase Auth...`);
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: sampleEmail,
        password: samplePassword,
        email_confirm: true,
        user_metadata: {
          full_name: sampleName,
          role: sampleRole,
        },
      });

      if (createError) throw createError;
      user = created.user;
      console.log(`✓ Successfully inscribed user in Supabase Auth! (ID: ${user.id})`);
    }

    // 2. Ensure profile exists in public.profiles table
    console.log('📜 Synchronizing user profile in public.profiles table...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: sampleName,
        role: sampleRole,
      }, { onConflict: 'id' });

    if (profileError) {
      console.warn('Note on public.profiles table:', profileError.message);
      console.log('💡 Tip: Make sure you have run supabase-schema.sql in your Supabase SQL Editor if tables are not yet created.');
    } else {
      console.log('✓ Profile successfully recorded in public.profiles.');
    }

    // 3. Ensure database tables and sample data are populated
    console.log('\n📦 Seeding alchemical inventory and data records for Deva...');
    const initialData = JSON.parse(fs.readFileSync(initialDataPath, 'utf-8'));

    // Products
    const productsToUpsert = initialData.ingredients.map(i => ({
      id: i.id,
      name: i.name,
      description: `${i.name} — rare ${i.rarity} ${i.category} curated for Deva's apothecary.`,
      category: i.category,
      unit: i.unit,
      minimum_stock: i.minThreshold,
      cost_per_unit: i.costPerUnit,
      lead_time_days: i.leadTimeDays,
      supplier: i.supplier,
      purity: i.purity,
      rarity: i.rarity,
      daily_consumption: i.dailyConsumption
    }));

    const { error: prodErr } = await supabase
      .from('products')
      .upsert(productsToUpsert, { onConflict: 'id' });

    if (!prodErr) {
      console.log(`✓ Synchronized ${productsToUpsert.length} products in database.`);

      // Inventory
      const inventoryToUpsert = initialData.ingredients.map(i => ({
        product_id: i.id,
        quantity: i.currentStock,
        updated_at: new Date().toISOString()
      }));

      await supabase
        .from('inventory')
        .upsert(inventoryToUpsert, { onConflict: 'product_id' });
      console.log(`✓ Synchronized ${inventoryToUpsert.length} inventory stock records.`);
    }

    // Also populate ingredients table for fallback
    const ingredientsToUpsert = initialData.ingredients.map(i => ({
      id: i.id,
      name: i.name,
      category: i.category,
      current_stock: i.currentStock,
      unit: i.unit,
      min_threshold: i.minThreshold,
      cost_per_unit: i.costPerUnit,
      lead_time_days: i.leadTimeDays,
      supplier: i.supplier,
      purity: i.purity,
      rarity: i.rarity,
      daily_consumption: i.dailyConsumption
    }));

    await supabase
      .from('ingredients')
      .upsert(ingredientsToUpsert, { onConflict: 'id' });

    // Potions
    const potionsToUpsert = initialData.potions.map(p => ({
      id: p.id,
      name: p.name,
      tier: p.tier,
      price: p.price,
      description: p.description,
      recipe: p.recipe
    }));
    await supabase.from('potions').upsert(potionsToUpsert, { onConflict: 'id' });
    console.log(`✓ Synchronized ${potionsToUpsert.length} potion recipes.`);

    // Sales
    const salesToUpsert = initialData.sales.map(s => ({
      id: s.id,
      potion_id: s.potionId,
      potion_name: s.potionName,
      quantity: s.quantity,
      total_gold: s.totalGold,
      customer: s.customer,
      guild: s.guild,
      ingredients_deducted: s.ingredientsDeducted
    }));
    await supabase.from('sales').upsert(salesToUpsert, { onConflict: 'id' });
    console.log(`✓ Synchronized ${salesToUpsert.length} sales transaction orders.`);

    // Anomalies
    const anomaliesToUpsert = initialData.anomalies.map(a => ({
      id: a.id,
      title: a.title,
      product_id: a.ingredientId,
      product_name: a.ingredientName,
      anomaly_type: a.anomalyType,
      severity: a.severity,
      description: a.description,
      recommended_action: a.recommendedAction,
      status: a.status
    }));
    await supabase.from('anomalies').upsert(anomaliesToUpsert, { onConflict: 'id' });
    console.log(`✓ Synchronized ${anomaliesToUpsert.length} anomaly containment records.`);

    // Settings
    await supabase
      .from('settings')
      .upsert({
        id: 'global_settings',
        shop_name: "Deva's Alchemical Sanctum",
        alchemist_in_charge: 'Deva',
        currency_symbol: '⟡ ARC',
        low_stock_warning_threshold: 25,
        auto_restock_threshold_days: 3,
        prophecy_horizon_days: 14,
        sound_effects_enabled: true,
        haptic_runes: true,
        auto_warding_defense: false
      }, { onConflict: 'id' });

    console.log('\n======================================================');
    console.log('🎉 SAMPLE USER & DATABASE RECORDS CREATED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Email:    kunjatadevu2008@gmail.com');
    console.log('Password: Password123!');
    console.log('Name:     Deva');
    console.log('Role:     Grand Magister Cynthia (Lead Alchemist)');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Error creating sample user:', err.message);
  }
}

createSampleUser();

