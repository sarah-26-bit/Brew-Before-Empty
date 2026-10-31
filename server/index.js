import express from 'express';
import cors from 'cors';
import { getDatabase, saveDatabase, resetDatabase } from './db.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Helper to enrich ingredients with dynamic status
function enrichIngredient(ing, curseMultiplier = 1.0) {
  const effectiveDaily = Number((ing.dailyConsumption * curseMultiplier).toFixed(2));
  const daysRemaining = effectiveDaily > 0 
    ? Math.max(0, Math.floor(ing.currentStock / effectiveDaily))
    : 999;
  
  const now = new Date();
  const stockoutDate = new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000);

  let stockStatus = 'HEALTHY';
  if (ing.currentStock <= 0) {
    stockStatus = 'OUT_OF_STOCK';
  } else if (ing.currentStock <= ing.minThreshold * 0.5) {
    stockStatus = 'CRITICAL';
  } else if (ing.currentStock <= ing.minThreshold) {
    stockStatus = 'LOW';
  }

  return {
    ...ing,
    effectiveDailyConsumption: effectiveDaily,
    isLowStock: ing.currentStock <= ing.minThreshold,
    stockStatus,
    daysRemaining,
    stockoutDate: ing.currentStock <= 0 ? 'Depleted' : stockoutDate.toISOString().split('T')[0],
  };
}

// ----------------- HEALTH & OVERVIEW -----------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'SPELLSTOCK Core Alchemical Engine',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/overview', (req, res) => {
  const db = getDatabase();
  const curseMult = db.curseState?.active ? (db.curseState.multiplier || 1.75) : 1.0;
  const ingredients = db.ingredients.map(ing => enrichIngredient(ing, curseMult));
  
  const totalStockItems = ingredients.reduce((sum, ing) => sum + ing.currentStock, 0);
  const totalInventoryValue = ingredients.reduce((sum, ing) => sum + (ing.currentStock * ing.costPerUnit), 0);
  const lowStockCount = ingredients.filter(ing => ing.isLowStock).length;
  const criticalStockCount = ingredients.filter(ing => ing.stockStatus === 'CRITICAL' || ing.stockStatus === 'OUT_OF_STOCK').length;
  const activeAnomaliesCount = db.anomalies.filter(a => a.status === 'ACTIVE').length;
  const totalSalesRevenue = db.sales.reduce((sum, s) => sum + s.totalGold, 0);

  res.json({
    metrics: {
      totalStockItems,
      totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      lowStockCount,
      criticalStockCount,
      activeAnomaliesCount,
      totalSalesRevenue: Number(totalSalesRevenue.toFixed(2)),
      transactionCount: db.sales.length,
      curseActive: !!db.curseState?.active
    },
    lowStockIngredients: ingredients.filter(ing => ing.isLowStock),
    recentSales: db.sales.slice(0, 5),
    recentAnomalies: db.anomalies.slice(0, 3),
    curseState: db.curseState
  });
});

// ----------------- INGREDIENTS CRUD -----------------
app.get('/api/ingredients', (req, res) => {
  const db = getDatabase();
  const curseMult = db.curseState?.active ? (db.curseState.multiplier || 1.75) : 1.0;
  const ingredients = db.ingredients.map(ing => enrichIngredient(ing, curseMult));
  res.json(ingredients);
});

app.post('/api/ingredients', (req, res) => {
  const db = getDatabase();
  const {
    name,
    category = 'General Reagents',
    currentStock = 0,
    unit = 'units',
    minThreshold = 20,
    costPerUnit = 10,
    supplier = 'Alchemical Guild',
    purity = '95.0%',
    rarity = 'Common',
    dailyConsumption = 2.0,
    leadTimeDays = 3
  } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Ingredient name is required' });
  }

  const newIngredient = {
    id: `ing-${Date.now()}`,
    name: name.trim(),
    category,
    currentStock: Number(currentStock),
    unit,
    minThreshold: Number(minThreshold),
    costPerUnit: Number(costPerUnit),
    supplier,
    purity,
    rarity,
    dailyConsumption: Number(dailyConsumption) || 2.0,
    leadTimeDays: Number(leadTimeDays) || 3,
    lastUpdated: new Date().toISOString()
  };

  db.ingredients.push(newIngredient);

  // If added below threshold, log anomaly
  if (newIngredient.currentStock <= newIngredient.minThreshold) {
    db.anomalies.unshift({
      id: `anom-${Date.now()}`,
      title: `Low Initial Stock: ${newIngredient.name}`,
      ingredientId: newIngredient.id,
      ingredientName: newIngredient.name,
      severity: 'MEDIUM',
      detectedAt: new Date().toISOString(),
      description: `Newly cataloged reagent has stock (${newIngredient.currentStock} ${newIngredient.unit}) below safety threshold (${newIngredient.minThreshold}).`,
      anomalyType: 'Stockout Risk',
      status: 'ACTIVE',
      recommendedAction: 'Schedule procurement order with supplier.'
    });
  }

  saveDatabase(db);
  res.status(201).json(enrichIngredient(newIngredient));
});

app.put('/api/ingredients/:id', (req, res) => {
  const db = getDatabase();
  const idx = db.ingredients.findIndex(ing => ing.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Ingredient not found' });
  }

  const existing = db.ingredients[idx];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id, // prevent ID overwrite
    currentStock: req.body.currentStock !== undefined ? Number(req.body.currentStock) : existing.currentStock,
    minThreshold: req.body.minThreshold !== undefined ? Number(req.body.minThreshold) : existing.minThreshold,
    costPerUnit: req.body.costPerUnit !== undefined ? Number(req.body.costPerUnit) : existing.costPerUnit,
    dailyConsumption: req.body.dailyConsumption !== undefined ? Number(req.body.dailyConsumption) : existing.dailyConsumption,
    leadTimeDays: req.body.leadTimeDays !== undefined ? Number(req.body.leadTimeDays) : existing.leadTimeDays,
    lastUpdated: new Date().toISOString()
  };

  db.ingredients[idx] = updated;
  saveDatabase(db);
  res.json(enrichIngredient(updated));
});

app.delete('/api/ingredients/:id', (req, res) => {
  const db = getDatabase();
  const idx = db.ingredients.findIndex(ing => ing.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Ingredient not found' });
  }

  const deleted = db.ingredients.splice(idx, 1)[0];
  // Clean up references in anomalies if needed
  saveDatabase(db);
  res.json({ message: 'Ingredient banishment complete', deleted });
});

// ----------------- POTIONS & RECIPES -----------------
app.get('/api/potions', (req, res) => {
  const db = getDatabase();
  const potionsWithCraftability = db.potions.map(potion => {
    // Check how many can be brewed
    let maxCraftable = 9999;
    potion.recipe.forEach(item => {
      const ing = db.ingredients.find(i => i.id === item.ingredientId);
      if (!ing || ing.currentStock <= 0) {
        maxCraftable = 0;
      } else {
        const canMake = Math.floor(ing.currentStock / item.quantity);
        if (canMake < maxCraftable) {
          maxCraftable = canMake;
        }
      }
    });

    return {
      ...potion,
      maxCraftable: maxCraftable === 9999 ? 0 : maxCraftable,
      canBrew: maxCraftable > 0
    };
  });

  res.json(potionsWithCraftability);
});

// ----------------- SALES & AUTOMATIC STOCK DEDUCTIONS -----------------
app.get('/api/sales', (req, res) => {
  const db = getDatabase();
  res.json(db.sales);
});

app.post('/api/sales', (req, res) => {
  const db = getDatabase();
  const {
    potionId,
    quantity = 1,
    customer = 'Anonymous Sorcerer',
    guild = 'Independent Wanderer'
  } = req.body;

  const qty = Number(quantity);
  if (!qty || qty <= 0) {
    return res.status(400).json({ error: 'Valid positive quantity required' });
  }

  const potion = db.potions.find(p => p.id === potionId);
  if (!potion) {
    return res.status(404).json({ error: 'Selected potion not found in grim catalogue' });
  }

  // Check ingredient availability
  const deductions = [];
  const missing = [];

  for (const reqItem of potion.recipe) {
    const ing = db.ingredients.find(i => i.id === reqItem.ingredientId);
    const needed = reqItem.quantity * qty;
    if (!ing || ing.currentStock < needed) {
      missing.push({
        ingredientName: reqItem.ingredientName,
        required: needed,
        available: ing ? ing.currentStock : 0,
        unit: reqItem.unit
      });
    } else {
      deductions.push({
        ingredient: ing,
        amount: needed,
        unit: reqItem.unit,
        name: reqItem.ingredientName
      });
    }
  }

  if (missing.length > 0) {
    return res.status(400).json({
      error: 'Insufficient magical ingredients to complete transaction',
      missingIngredients: missing
    });
  }

  // AUTOMATIC STOCK DEDUCTIONS
  const ingredientsDeductedReport = [];
  deductions.forEach(item => {
    item.ingredient.currentStock = Math.max(0, item.ingredient.currentStock - item.amount);
    item.ingredient.lastUpdated = new Date().toISOString();
    ingredientsDeductedReport.push({
      ingredientName: item.name,
      amount: item.amount,
      unit: item.unit
    });

    // If stock dropped below threshold, trigger anomaly
    if (item.ingredient.currentStock <= item.ingredient.minThreshold) {
      const existingAnomaly = db.anomalies.find(
        a => a.ingredientId === item.ingredient.id && a.status === 'ACTIVE'
      );
      if (!existingAnomaly) {
        db.anomalies.unshift({
          id: `anom-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          title: `Rapid Depletion: ${item.name}`,
          ingredientId: item.ingredient.id,
          ingredientName: item.name,
          severity: item.ingredient.currentStock === 0 ? 'CRITICAL' : 'HIGH',
          detectedAt: new Date().toISOString(),
          description: `Stock deducted to ${item.ingredient.currentStock} ${item.ingredient.unit} after sale of ${qty}x ${potion.name}.`,
          anomalyType: 'Stockout Risk',
          status: 'ACTIVE',
          recommendedAction: 'Execute Restock Spell immediately.'
        });
      }
    }
  });

  const totalGold = Number((potion.price * qty).toFixed(2));
  const newSale = {
    id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    potionId: potion.id,
    potionName: potion.name,
    quantity: qty,
    totalGold,
    customer: customer.trim(),
    guild: guild.trim(),
    ingredientsDeducted: ingredientsDeductedReport
  };

  db.sales.unshift(newSale);
  saveDatabase(db);

  res.status(201).json({
    message: 'Sale recorded & stock successfully deducted by alchemy',
    transaction: newSale,
    updatedIngredients: deductions.map(d => enrichIngredient(d.ingredient))
  });
});

// ----------------- PROPHECY AI -----------------
app.get('/api/prophecy', (req, res) => {
  const db = getDatabase();
  const curseMult = db.curseState?.active ? (db.curseState.multiplier || 1.75) : 1.0;
  const ingredients = db.ingredients.map(ing => enrichIngredient(ing, curseMult));

  // Generate 14-day projection data
  const days = 14;
  const forecastData = [];
  const now = new Date();

  for (let i = -7; i <= days; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dateLabel = d.toISOString().split('T')[0];
    const isPast = i <= 0;

    // Base seasonal curve
    const dayFactor = 1 + Math.sin(i / 2) * 0.25;
    const baseDemand = 45 * dayFactor * curseMult;
    const actual = isPast ? Math.round(baseDemand + (Math.sin(i * 1.5) * 8)) : null;
    const predicted = Math.round(baseDemand);
    const confidenceUpper = Math.round(predicted * 1.15);
    const confidenceLower = Math.max(10, Math.round(predicted * 0.85));

    forecastData.push({
      date: dateLabel,
      isPast,
      actualDemand: actual,
      predictedDemand: predicted,
      confidenceUpper,
      confidenceLower,
      curseImpact: Math.round(predicted * (curseMult - 1.0))
    });
  }

  // Stockout Risk Table
  const stockoutRisk = ingredients.map(ing => {
    let riskLevel = 'LOW';
    if (ing.daysRemaining <= 2) riskLevel = 'CRITICAL';
    else if (ing.daysRemaining <= 5) riskLevel = 'HIGH';
    else if (ing.daysRemaining <= 10) riskLevel = 'MODERATE';

    return {
      id: ing.id,
      name: ing.name,
      category: ing.category,
      currentStock: ing.currentStock,
      unit: ing.unit,
      dailyConsumption: ing.effectiveDailyConsumption,
      daysRemaining: ing.daysRemaining,
      stockoutDate: ing.stockoutDate,
      riskLevel,
      recommendedBuffer: Math.round(ing.effectiveDailyConsumption * ing.leadTimeDays * 1.5)
    };
  }).sort((a, b) => a.daysRemaining - b.daysRemaining);

  res.json({
    curseActive: !!db.curseState?.active,
    curseMultiplier: curseMult,
    forecastHorizonDays: days,
    forecastTimeline: forecastData,
    stockoutRisks: stockoutRisk,
    aiProphetInsights: [
      {
        id: 'ins-1',
        title: 'Imminent Ectoplasmic Famine',
        urgency: 'HIGH',
        body: 'Ectoplasmic Resin will be entirely depleted within 48 hours under current necrotic atmospheric pressure.'
      },
      {
        id: 'ins-2',
        title: 'Blood Moon Convergence Spike',
        urgency: 'MEDIUM',
        body: 'Dragon Scale demand projected to jump +65% as Guild warriors prepare for the Midnight Crucible.'
      },
      {
        id: 'ins-3',
        title: 'Optimal Restock Window',
        urgency: 'POSITIVE',
        body: 'Silverleaf Grove suppliers report surplus Moonlit Dewdrops; order now for 15% wholesale discount.'
      }
    ]
  });
});

app.post('/api/prophecy/simulate-spike', (req, res) => {
  const db = getDatabase();
  const { spikeType = 'BLOOD_MOON', multiplier = 2.0 } = req.body;

  const validMultipliers = {
    BLOOD_MOON: 1.85,
    WITCHES_EVE: 2.4,
    SOLSTICE: 1.5,
    NECROTIC_SURGE: 3.1
  };

  const finalMultiplier = Number(multiplier) || validMultipliers[spikeType] || 2.0;

  // Temporarily update or simulate in response
  const simulatedIngredients = db.ingredients.map(ing => {
    const acceleratedDaily = Number((ing.dailyConsumption * finalMultiplier).toFixed(2));
    const acceleratedDays = acceleratedDaily > 0 ? Math.max(0, Math.floor(ing.currentStock / acceleratedDaily)) : 999;
    const now = new Date();
    const acceleratedStockout = new Date(now.getTime() + acceleratedDays * 24 * 60 * 60 * 1000);

    return {
      id: ing.id,
      name: ing.name,
      currentStock: ing.currentStock,
      unit: ing.unit,
      originalDaily: ing.dailyConsumption,
      acceleratedDaily,
      originalDaysRemaining: Math.floor(ing.currentStock / ing.dailyConsumption),
      acceleratedDaysRemaining: acceleratedDays,
      acceleratedStockoutDate: ing.currentStock <= 0 ? 'Depleted' : acceleratedStockout.toISOString().split('T')[0],
      daysLost: Math.max(0, Math.floor(ing.currentStock / ing.dailyConsumption) - acceleratedDays)
    };
  });

  res.json({
    spikeType,
    multiplier: finalMultiplier,
    impactSummary: `Simulated ${spikeType} surge with ${finalMultiplier}x consumption velocity applied across the pantry.`,
    simulatedIngredients: simulatedIngredients.sort((a, b) => a.acceleratedDaysRemaining - b.acceleratedDaysRemaining)
  });
});

// ----------------- RESTOCK SPELL -----------------
app.get('/api/restock', (req, res) => {
  const db = getDatabase();
  const curseMult = db.curseState?.active ? (db.curseState.multiplier || 1.75) : 1.0;
  const ingredients = db.ingredients.map(ing => enrichIngredient(ing, curseMult));

  // Determine items that need restocking
  const restockItems = ingredients.map(ing => {
    const safeStock = ing.minThreshold * 2;
    const leadTimeUsage = ing.effectiveDailyConsumption * ing.leadTimeDays;
    const targetStock = Math.ceil(safeStock + leadTimeUsage);
    const orderQty = Math.max(0, targetStock - ing.currentStock);
    const estimatedCost = Number((orderQty * ing.costPerUnit).toFixed(2));

    let urgency = 'ROUTINE';
    if (ing.currentStock <= 0 || ing.stockStatus === 'CRITICAL') {
      urgency = 'CRITICAL';
    } else if (ing.isLowStock) {
      urgency = 'HIGH';
    } else if (orderQty > 0 && ing.daysRemaining <= 7) {
      urgency = 'MEDIUM';
    }

    return {
      id: ing.id,
      name: ing.name,
      category: ing.category,
      currentStock: ing.currentStock,
      minThreshold: ing.minThreshold,
      unit: ing.unit,
      costPerUnit: ing.costPerUnit,
      supplier: ing.supplier,
      suggestedRestockQty: orderQty,
      estimatedCost,
      urgency,
      leadTimeDays: ing.leadTimeDays,
      daysRemaining: ing.daysRemaining
    };
  }).filter(item => item.suggestedRestockQty > 0)
    .sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, ROUTINE: 3 };
      return order[a.urgency] - order[b.urgency];
    });

  const totalRestockCost = restockItems.reduce((acc, item) => acc + item.estimatedCost, 0);

  res.json({
    totalRecommendations: restockItems.length,
    totalEstimatedGold: Number(totalRestockCost.toFixed(2)),
    recommendations: restockItems
  });
});

app.post('/api/restock/execute', (req, res) => {
  const db = getDatabase();
  const { ingredientIds, customAmounts = {} } = req.body;

  let restockedCount = 0;
  let totalCost = 0;
  const restockedDetails = [];

  db.ingredients.forEach(ing => {
    // If no specific IDs passed, restock all items that are low or below safety threshold
    const shouldRestock = !ingredientIds || ingredientIds.length === 0 || ingredientIds.includes(ing.id);

    if (shouldRestock) {
      const customQty = customAmounts[ing.id];
      let addQty = 0;
      if (customQty !== undefined && Number(customQty) > 0) {
        addQty = Number(customQty);
      } else {
        const safeStock = ing.minThreshold * 2;
        const leadTimeUsage = ing.dailyConsumption * ing.leadTimeDays;
        const targetStock = Math.ceil(safeStock + leadTimeUsage);
        addQty = Math.max(10, targetStock - ing.currentStock);
      }

      ing.currentStock += addQty;
      ing.lastUpdated = new Date().toISOString();
      const cost = addQty * ing.costPerUnit;
      totalCost += cost;
      restockedCount++;

      restockedDetails.push({
        id: ing.id,
        name: ing.name,
        quantityAdded: addQty,
        newStock: ing.currentStock,
        unit: ing.unit,
        cost: Number(cost.toFixed(2))
      });

      // Resolve matching anomalies for this ingredient
      db.anomalies.forEach(a => {
        if (a.ingredientId === ing.id && a.status === 'ACTIVE') {
          a.status = 'RESOLVED';
          a.resolvedAt = new Date().toISOString();
          a.resolutionNote = `Restocked ${addQty} ${ing.unit} via Restock Spell invocation.`;
        }
      });
    }
  });

  saveDatabase(db);

  res.json({
    success: true,
    spellName: 'Incantation of Abundant Harvest',
    itemsRestocked: restockedCount,
    totalCost: Number(totalCost.toFixed(2)),
    details: restockedDetails,
    timestamp: new Date().toISOString()
  });
});

// ----------------- STRANGE HAPPENINGS / ANOMALIES -----------------
app.get('/api/anomalies', (req, res) => {
  const db = getDatabase();
  res.json(db.anomalies);
});

app.post('/api/anomalies/:id/resolve', (req, res) => {
  const db = getDatabase();
  const anomaly = db.anomalies.find(a => a.id === req.params.id);
  if (!anomaly) {
    return res.status(404).json({ error: 'Anomaly trace not found' });
  }

  anomaly.status = 'RESOLVED';
  anomaly.resolvedAt = new Date().toISOString();
  anomaly.resolutionNote = req.body.note || 'Ward runes etched and equilibrium restored.';

  saveDatabase(db);
  res.json(anomaly);
});

app.post('/api/anomalies', (req, res) => {
  const db = getDatabase();
  const { title, ingredientId, severity = 'MEDIUM', description, anomalyType = 'Aetheric Disturbance' } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Anomaly title required' });
  }

  const ing = ingredientId ? db.ingredients.find(i => i.id === ingredientId) : null;

  const newAnomaly = {
    id: `anom-${Date.now()}`,
    title: title.trim(),
    ingredientId: ing ? ing.id : null,
    ingredientName: ing ? ing.name : 'Unknown Reagent',
    severity,
    detectedAt: new Date().toISOString(),
    description: description || 'Spontaneous fluctuation in the magical weave.',
    anomalyType,
    status: 'ACTIVE',
    recommendedAction: 'Inspect storage ward and reapply stabilizing salt.'
  };

  db.anomalies.unshift(newAnomaly);
  saveDatabase(db);
  res.status(201).json(newAnomaly);
});

// ----------------- CRYSTAL BALL ANALYTICS -----------------
app.get('/api/analytics', (req, res) => {
  const db = getDatabase();
  const ingredients = db.ingredients.map(ing => enrichIngredient(ing));

  // Category breakdown
  const categoryMap = {};
  ingredients.forEach(ing => {
    if (!categoryMap[ing.category]) {
      categoryMap[ing.category] = { category: ing.category, count: 0, totalValue: 0, items: [] };
    }
    categoryMap[ing.category].count++;
    categoryMap[ing.category].totalValue += (ing.currentStock * ing.costPerUnit);
    categoryMap[ing.category].items.push(ing.name);
  });

  const categoryBreakdown = Object.values(categoryMap).map(c => ({
    ...c,
    totalValue: Number(c.totalValue.toFixed(2))
  }));

  // Historical vs Predicted Demand (for Recharts)
  const historicalVsPredicted = [
    { period: 'Day -6', historical: 38, predicted: 35, variance: '+3' },
    { period: 'Day -5', historical: 42, predicted: 40, variance: '+2' },
    { period: 'Day -4', historical: 55, predicted: 50, variance: '+5' },
    { period: 'Day -3', historical: 48, predicted: 46, variance: '+2' },
    { period: 'Day -2', historical: 62, predicted: 58, variance: '+4' },
    { period: 'Day -1', historical: 70, predicted: 65, variance: '+5' },
    { period: 'Today (Day 0)', historical: 84, predicted: 80, variance: '+4' },
    { period: 'Day +1', historical: null, predicted: 88, upper: 98, lower: 78 },
    { period: 'Day +2', historical: null, predicted: 95, upper: 107, lower: 83 },
    { period: 'Day +3', historical: null, predicted: 105, upper: 118, lower: 92 },
    { period: 'Day +4', historical: null, predicted: 112, upper: 128, lower: 96 },
    { period: 'Day +5', historical: null, predicted: 120, upper: 138, lower: 102 },
    { period: 'Day +6', historical: null, predicted: 135, upper: 154, lower: 116 },
    { period: 'Day +7', historical: null, predicted: 140, upper: 162, lower: 120 },
  ];

  // Top potions performance
  const potionSalesMap = {};
  db.sales.forEach(sale => {
    if (!potionSalesMap[sale.potionName]) {
      potionSalesMap[sale.potionName] = { name: sale.potionName, quantitySold: 0, revenue: 0 };
    }
    potionSalesMap[sale.potionName].quantitySold += sale.quantity;
    potionSalesMap[sale.potionName].revenue += sale.totalGold;
  });

  const topPotions = Object.values(potionSalesMap).sort((a, b) => b.revenue - a.revenue);

  res.json({
    categoryBreakdown,
    historicalVsPredicted,
    topPotions,
    inventoryTurnoverRate: '4.8x / cycle',
    stockoutRiskIndex: '18.4% (Moderate)',
    accuracyRate: '94.2%',
    totalRevenue: db.sales.reduce((sum, s) => sum + s.totalGold, 0)
  });
});

// ----------------- MIDNIGHT CURSE -----------------
app.get('/api/curse', (req, res) => {
  const db = getDatabase();
  res.json(db.curseState);
});

app.post('/api/curse/toggle', (req, res) => {
  const db = getDatabase();
  const { active, curseLevel, multiplier, name, description } = req.body;

  db.curseState = {
    ...db.curseState,
    active: active !== undefined ? !!active : !db.curseState.active,
    curseLevel: curseLevel || db.curseState.curseLevel,
    multiplier: multiplier ? Number(multiplier) : db.curseState.multiplier,
    name: name || db.curseState.name,
    description: description || db.curseState.description,
    lastToggled: new Date().toISOString()
  };

  saveDatabase(db);
  res.json({
    message: db.curseState.active ? 'Curse surge awakened!' : 'Curse banished by holy ward!',
    curseState: db.curseState
  });
});

// ----------------- SETTINGS & RESET -----------------
app.get('/api/settings', (req, res) => {
  const db = getDatabase();
  res.json(db.settings);
});

app.put('/api/settings', (req, res) => {
  const db = getDatabase();
  db.settings = {
    ...db.settings,
    ...req.body
  };
  saveDatabase(db);
  res.json(db.settings);
});

app.post('/api/settings/reset', (req, res) => {
  const freshDb = resetDatabase();
  res.json({
    message: 'Sanctum inventory restored to pristine primordial state.',
    db: freshDb
  });
});

app.listen(PORT, () => {
  console.log(`✨ SPELLSTOCK Backend running on http://localhost:${PORT}`);
  console.log(`🔮 Alchemical endpoints active and bound to astral plane.`);
});

