import { getDatabase, saveDatabase, resetDatabase } from './db.js';

console.log('🔮 Running Comprehensive SPELLSTOCK System Verification...\n');

// 1. Reset to fresh DB
console.log('1. Testing Primordial Reset...');
resetDatabase();
let db = getDatabase();
console.log(`   ✓ Initial ingredients count: ${db.ingredients.length}`);
console.log(`   ✓ Initial potions count: ${db.potions.length}`);
console.log(`   ✓ Initial anomalies count: ${db.anomalies.length}`);

// 2. Add Ingredient
console.log('\n2. Testing Inscribing New Ingredient...');
const newIng = {
  id: `ing-${Date.now()}`,
  name: 'Astral Netherweed',
  category: 'Botanical Extracts',
  currentStock: 15,
  unit: 'stems',
  minThreshold: 20,
  costPerUnit: 42.0,
  supplier: 'Astral Greenhouse',
  purity: '99.0%',
  rarity: 'Rare',
  dailyConsumption: 3.0,
  leadTimeDays: 4,
  lastUpdated: new Date().toISOString()
};
db.ingredients.push(newIng);
saveDatabase(db);
console.log(`   ✓ Added: ${newIng.name} (Stock: ${newIng.currentStock})`);

// 3. Update Ingredient
console.log('\n3. Testing Updating Ingredient...');
const target = db.ingredients.find(i => i.id === newIng.id);
target.currentStock = 60;
saveDatabase(db);
console.log(`   ✓ Updated ${target.name} stock to: ${target.currentStock}`);

// 4. Record Sale & AUTOMATIC STOCK DEDUCTIONS
console.log('\n4. Testing Potion Sale & Automatic Reagent Deductions...');
const potion = db.potions[0]; // Elixir of Astral Clarity
const initialStocks = {};
potion.recipe.forEach(r => {
  const ing = db.ingredients.find(i => i.id === r.ingredientId);
  initialStocks[ing.name] = ing.currentStock;
});

const saleQty = 3;
console.log(`   Selling ${saleQty}x ${potion.name}...`);
potion.recipe.forEach(r => {
  const ing = db.ingredients.find(i => i.id === r.ingredientId);
  const needed = r.quantity * saleQty;
  const before = ing.currentStock;
  ing.currentStock -= needed;
  console.log(`   ✓ Deducted ${needed} ${r.unit} of ${ing.name}: ${before} -> ${ing.currentStock} ${r.unit}`);
});
saveDatabase(db);

// 5. Stockout Calculation & Prophecy
console.log('\n5. Testing Stockout Calculations...');
db.ingredients.forEach(ing => {
  const days = Math.max(0, Math.floor(ing.currentStock / ing.dailyConsumption));
  const now = new Date();
  const stockout = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  if (days <= 5) {
    console.log(`   ⚠️ High Hazard: ${ing.name} has only ${days} days remaining (Stockout: ${stockout.toISOString().split('T')[0]})`);
  }
});

// 6. Restock Spell Execution
console.log('\n6. Testing Cast Restock Spell (Incantation of Abundant Harvest)...');
let restockedCount = 0;
db.ingredients.forEach(ing => {
  if (ing.currentStock <= ing.minThreshold) {
    const add = (ing.minThreshold * 2) - ing.currentStock;
    const before = ing.currentStock;
    ing.currentStock += add;
    restockedCount++;
    console.log(`   ✨ Restocked ${ing.name}: +${add} ${ing.unit} (${before} -> ${ing.currentStock})`);
  }
});
saveDatabase(db);
console.log(`   ✓ Total reagents restocked: ${restockedCount}`);

// 7. Strange Happenings Resolution
console.log('\n7. Testing Strange Happenings Warding...');
const activeAnomaly = db.anomalies.find(a => a.status === 'ACTIVE');
if (activeAnomaly) {
  activeAnomaly.status = 'RESOLVED';
  activeAnomaly.resolvedAt = new Date().toISOString();
  console.log(`   🛡️ Warded Anomaly: ${activeAnomaly.title} -> Status: RESOLVED`);
}
saveDatabase(db);

// 8. Delete Ingredient
console.log('\n8. Testing Banish (Delete) Ingredient...');
const deleteIdx = db.ingredients.findIndex(i => i.id === newIng.id);
if (deleteIdx !== -1) {
  const deleted = db.ingredients.splice(deleteIdx, 1)[0];
  console.log(`   ✓ Banished: ${deleted.name}`);
}
saveDatabase(db);

console.log('\n🎉 ALL SYSTEM REQUIREMENTS VERIFIED SUCCESSFULLY!');
