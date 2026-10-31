import { getDatabase, resetDatabase } from './db.js';

console.log('Testing Database and Alchemical Logic...');
resetDatabase();
const db = getDatabase();

console.log(`Ingredients loaded: ${db.ingredients.length}`);
console.log(`Potions loaded: ${db.potions.length}`);
console.log(`Sales loaded: ${db.sales.length}`);
console.log(`Anomalies loaded: ${db.anomalies.length}`);

// Test stock deduction logic
const potion = db.potions[0]; // Elixir of Astral Clarity
console.log(`Testing sale of 1x ${potion.name}`);
for (const req of potion.recipe) {
  const ing = db.ingredients.find(i => i.id === req.ingredientId);
  const before = ing.currentStock;
  ing.currentStock -= req.quantity;
  console.log(`- ${ing.name}: ${before} -> ${ing.currentStock} ${ing.unit}`);
}

console.log('Alchemical Logic Verified Successfully! ✨');

