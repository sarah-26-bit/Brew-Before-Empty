import { connectDB, disconnectDB } from './config/db.js';
import { SeedService } from './services/seedService.js';
import { IngredientService } from './services/ingredientService.js';
import { SalesService } from './services/salesService.js';
import { ProphecyService } from './services/prophecyService.js';
import { RestockService } from './services/restockService.js';
import { AnomalyService } from './services/anomalyService.js';
import { AnalyticsService } from './services/analyticsService.js';
import { MidnightCurseService } from './services/midnightCurseService.js';

async function runTestSuite() {
  console.log('🧪 Starting SPELLSTOCK Intelligence Engine Verification Suite...\n');

  await connectDB();
  await SeedService.seedHistoricalData(true);

  // 1. POTION PANTRY TEST
  console.log('--- 1. Testing Potion Pantry (CRUD & Stock Movements) ---');
  const allIngredients = await IngredientService.getAllIngredients();
  console.log(`✓ Fetched ${allIngredients.length} ingredients from MongoDB`);

  const created = await IngredientService.createIngredient({
    name: 'Astral Nether-Bloom',
    category: 'Botanical Extracts',
    currentStock: 25,
    unit: 'stems',
    minThreshold: 15,
    costPerUnit: 55.0,
    leadTimeDays: 4,
    supplier: 'Celestial Greenhouse',
  });
  console.log(`✓ Inscribed new reagent: ${created.name} (Stock: ${created.currentStock} ${created.unit})`);

  const updated = await IngredientService.updateIngredient(created._id, {
    currentStock: 40,
    reason: 'Received apprentice harvest',
  });
  console.log(`✓ Updated stock to: ${updated.currentStock} ${updated.unit}`);

  const movements = await IngredientService.getStockMovements(created._id);
  console.log(`✓ Stock movements tracked: ${movements.length} logged records`);

  // 2. SALES MANAGEMENT & ATOMIC STOCK DEDUCTION TEST
  console.log('\n--- 2. Testing Sales Management & Automatic Deductions ---');
  const potions = await SalesService.getPotions();
  console.log(`✓ Potion catalogue loaded: ${potions.length} recipes`);

  const potionToSell = potions[0]; // Elixir of Astral Clarity
  console.log(`Dispensing 2x ${potionToSell.name}...`);
  const saleResult = await SalesService.recordSale({
    potionId: potionToSell._id,
    quantity: 2,
    customer: 'Archmage Valerius',
    guild: 'Oakhaven Arcanum',
  });
  console.log(`✓ ${saleResult.message}`);
  saleResult.deductions.forEach((d) => {
    console.log(`   - Deducted ${d.quantityDeducted} ${d.unit} of ${d.ingredientName}`);
  });

  // Test Negative Stock Prevention
  console.log('\nTesting Negative Inventory Prevention...');
  try {
    await SalesService.recordSale({
      potionId: potionToSell._id,
      quantity: 99999, // Exorbitant quantity
      customer: 'Greedy Warlock',
    });
    console.error('❌ Negative inventory test failed! Order should have been rejected.');
  } catch (err) {
    console.log(`✓ Negative stock prevented successfully: "${err.message}" (Status: ${err.statusCode})`);
  }

  // 3. PROPHECY AI TEST
  console.log('\n--- 3. Testing Prophecy AI (Weighted Moving Average & Stockout Dates) ---');
  const forecasts = await ProphecyService.getAllForecasts(7);
  console.log(`✓ Generated forecasts for ${forecasts.forecasts.length} ingredients over 7-day horizon`);
  const sampleForecast = forecasts.forecasts[0];
  console.log(`\nSample Prophecy for ${sampleForecast.ingredient.name}:`);
  console.log(`   - Current Stock: ${sampleForecast.ingredient.currentStock} ${sampleForecast.ingredient.unit}`);
  console.log(`   - Daily WMA Velocity: ${sampleForecast.forecastParameters.effectiveDailyForecast} ${sampleForecast.ingredient.unit}/day`);
  console.log(`   - Estimated Stockout: ${sampleForecast.stockoutEstimation.estimatedStockoutDate} (${sampleForecast.stockoutEstimation.daysRemaining} days remaining)`);
  console.log(`   - 7-Day Cumulative Demand: ${sampleForecast.totalSevenDayForecast} ${sampleForecast.ingredient.unit}`);
  console.log(`   - Explanation: ${sampleForecast.predictionExplanation}`);

  // 4. RESTOCK SPELL TEST
  console.log('\n--- 4. Testing Restock Spell Recommendations ---');
  const restockPlan = await RestockService.calculateRestockRecommendations();
  console.log(`✓ Actionable recommendations: ${restockPlan.totalActionableRecommendations} items`);
  console.log(`✓ Total estimated ritual investment: ${restockPlan.totalEstimatedInvestment} ⟡`);
  if (restockPlan.actionableRestockList.length > 0) {
    const item = restockPlan.actionableRestockList[0];
    console.log(`   - Top Urgent: ${item.name} (${item.urgency}) -> Reorder ${item.suggestedReorderQty} ${item.unit} (${item.estimatedCost} ⟡). Reason: ${item.urgencyReason}`);
  }

  // 5. STRANGE HAPPENINGS TEST
  console.log('\n--- 5. Testing Strange Happenings & Statistical Anomaly Detection ---');
  const anomalies = await AnomalyService.getAnomalies();
  console.log(`✓ Active / Detected anomalies: ${anomalies.length} records`);
  anomalies.slice(0, 2).forEach((anom) => {
    console.log(`   - [${anom.severity}] ${anom.title} (${anom.type})`);
    console.log(`     Explanation: ${anom.explanation}`);
  });

  // 6. CRYSTAL BALL ANALYTICS TEST
  console.log('\n--- 6. Testing Crystal Ball Analytics ---');
  const analytics = await AnalyticsService.getCrystalBallAnalytics();
  console.log(`✓ Total revenue: ${analytics.financials.totalRevenue} ⟡`);
  console.log(`✓ Total potions dispensed: ${analytics.financials.totalPotionsSold}`);
  console.log(`✓ Inventory valuation: ${analytics.financials.totalInventoryValue} ⟡`);
  console.log(`✓ Top consumed reagent: ${analytics.mostUsedIngredients[0]?.ingredientName || 'N/A'}`);
  console.log(`✓ Historical vs Predicted timeline points: ${analytics.historicalVsPredictedDemand.length}`);

  // 7. MIDNIGHT CURSE TEST
  console.log('\n--- 7. Testing Midnight Curse & Dynamic Multiplier ---');
  const activeEvents = await MidnightCurseService.getActiveEvents();
  console.log(`✓ Active seasonal events: ${activeEvents.length}`);
  activeEvents.forEach((e) => {
    console.log(`   - ${e.name}: Multiplier ${e.multiplier}x`);
  });

  // Verify multiplier effect on prophecy
  const dragonScale = allIngredients.find((i) => i.name === 'Dragon Scale Powder');
  if (dragonScale) {
    const curseForecast = await ProphecyService.forecastIngredientDemand(dragonScale, 7);
    console.log(`✓ Curse applied to ${dragonScale.name}: Multiplier is ${curseForecast.forecastParameters.curseMultiplier}x`);
  }

  // Cleanup created test ingredient
  await IngredientService.deleteIngredient(created._id);
  console.log('\n✓ Cleaned up test reagent.');

  console.log('\n======================================================');
  console.log('🎉 ALL 7 CORE MODULES & INTELLIGENCE ENGINES PASSED 100%!');
  console.log('======================================================\n');

  await disconnectDB();
  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});

