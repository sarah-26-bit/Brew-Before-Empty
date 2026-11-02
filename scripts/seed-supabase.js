import { isSupabaseConfigured, getSupabaseAdminClient } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const initialDataPath = path.join(__dirname, '..', 'server', 'data', 'initialData.json');

async function seedSupabase() {
  console.log('⚡ Starting Supabase Data Seeding...');

  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase is not configured yet in .env!');
    console.log('\nPlease add your credentials to .env:');
    console.log('  SUPABASE_URL=https://your-project.supabase.co');
    console.log('  SUPABASE_ANON_KEY=your-anon-key');
    console.log('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (optional)\n');
    process.exit(1);
  }

  const supabase = getSupabaseAdminClient();
  const initialData = JSON.parse(fs.readFileSync(initialDataPath, 'utf-8'));

  try {
    // 1. Products & Inventory (Normalized Schema)
    console.log('📦 Seeding products into Supabase...');
    const productsToUpsert = initialData.ingredients.map(i => ({
      id: i.id,
      name: i.name,
      description: `${i.name} — rare ${i.rarity} ${i.category} supplied by ${i.supplier}.`,
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

    // Try seeding products table
    const { error: prodErr } = await supabase
      .from('products')
      .upsert(productsToUpsert, { onConflict: 'id' });

    if (prodErr) {
      console.warn('Note on products table:', prodErr.message);
    } else {
      console.log(`✓ Seeded ${productsToUpsert.length} products.`);

      // Seed inventory
      console.log('📊 Seeding inventory quantities...');
      const inventoryToUpsert = initialData.ingredients.map(i => ({
        product_id: i.id,
        quantity: i.currentStock,
        updated_at: new Date().toISOString()
      }));

      const { error: invErr } = await supabase
        .from('inventory')
        .upsert(inventoryToUpsert, { onConflict: 'product_id' });

      if (invErr) {
        console.warn('Note on inventory table:', invErr.message);
      } else {
        console.log(`✓ Seeded ${inventoryToUpsert.length} inventory records.`);
      }
    }

    // 2. Also populate ingredients table if present for legacy compatibility
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

    // 3. Potions
    console.log('🧪 Seeding potions catalogue...');
    const potionsToUpsert = initialData.potions.map(p => ({
      id: p.id,
      name: p.name,
      tier: p.tier,
      price: p.price,
      description: p.description,
      recipe: p.recipe
    }));

    const { error: potError } = await supabase
      .from('potions')
      .upsert(potionsToUpsert, { onConflict: 'id' });

    if (!potError) console.log(`✓ Seeded ${potionsToUpsert.length} potions.`);

    // 4. Sales Orders
    if (initialData.sales && initialData.sales.length > 0) {
      console.log('📜 Seeding sales order history...');
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

      const { error: saleErr } = await supabase
        .from('sales')
        .upsert(salesToUpsert, { onConflict: 'id' });

      if (!saleErr) console.log(`✓ Seeded ${salesToUpsert.length} sales records.`);
    }

    // 5. Anomalies
    if (initialData.anomalies && initialData.anomalies.length > 0) {
      console.log('🔮 Seeding anomalies...');
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

      const { error: anomErr } = await supabase
        .from('anomalies')
        .upsert(anomaliesToUpsert, { onConflict: 'id' });

      if (!anomErr) console.log(`✓ Seeded ${anomaliesToUpsert.length} anomalies.`);
    }

    // 6. Curse State
    if (initialData.curseState) {
      console.log('🌙 Seeding curse state...');
      await supabase
        .from('curse_state')
        .upsert({
          id: 'active_curse',
          name: initialData.curseState.name,
          active: initialData.curseState.active,
          curse_level: initialData.curseState.curseLevel,
          multiplier: initialData.curseState.multiplier,
          description: initialData.curseState.description,
          affected_products: initialData.curseState.affectedIngredients,
          warding_strength: initialData.curseState.wardingStrength,
          spoilage_rate: initialData.curseState.spoilageRate
        }, { onConflict: 'id' });
      console.log('✓ Seeded curse state.');
    }

    // 7. Settings
    if (initialData.settings) {
      console.log('⚙️ Seeding settings...');
      await supabase
        .from('settings')
        .upsert({
          id: 'global_settings',
          shop_name: initialData.settings.shopName,
          alchemist_in_charge: initialData.settings.alchemistInCharge,
          currency_symbol: initialData.settings.currencySymbol,
          low_stock_warning_threshold: initialData.settings.lowStockWarningThreshold,
          auto_restock_threshold_days: initialData.settings.autoRestockThresholdDays,
          prophecy_horizon_days: initialData.settings.prophecyHorizonDays,
          sound_effects_enabled: initialData.settings.soundEffectsEnabled,
          haptic_runes: initialData.settings.hapticRunes,
          auto_warding_defense: initialData.settings.autoWardingDefense
        }, { onConflict: 'id' });
      console.log('✓ Seeded settings.');
    }

    console.log('\n✨ Supabase successfully seeded with SPELLSTOCK alchemical database records!\n');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
}

seedSupabase();
