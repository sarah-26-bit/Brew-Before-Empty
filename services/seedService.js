import { Ingredient } from '../models/Ingredient.js';
import { Potion } from '../models/Potion.js';
import { Sale } from '../models/Sale.js';
import { StockMovement } from '../models/StockMovement.js';
import { SeasonalEvent } from '../models/SeasonalEvent.js';
import { Anomaly } from '../models/Anomaly.js';

export class SeedService {
  /**
   * Seed synthetic historical dataset for Hack-O-Lantern 2026 development & testing
   */
  static async seedHistoricalData(forceReset = false) {
    const existingCount = await Ingredient.countDocuments();
    if (existingCount > 0 && !forceReset) {
      console.log('🔮 Sanctum database already seeded with reagents.');
      return { message: 'Database already populated.' };
    }

    console.log('⚡ Purging existing records and inscribing synthetic primordial dataset...');
    await Promise.all([
      Ingredient.deleteMany({}),
      Potion.deleteMany({}),
      Sale.deleteMany({}),
      StockMovement.deleteMany({}),
      SeasonalEvent.deleteMany({}),
      Anomaly.deleteMany({}),
    ]);

    // 1. Inscribe Primary Ingredients
    const rawIngredients = [
      {
        name: 'Dragon Scale Powder',
        category: 'Mineral & Scales',
        currentStock: 42,
        unit: 'drams',
        minThreshold: 50,
        costPerUnit: 85.0,
        leadTimeDays: 5,
        supplier: 'Wyrmfang Smelters',
        purity: '99.4%',
        rarity: 'Legendary',
      },
      {
        name: 'Moonlit Dewdrops',
        category: 'Celestial Liquids',
        currentStock: 180,
        unit: 'fl. oz',
        minThreshold: 60,
        costPerUnit: 14.5,
        leadTimeDays: 2,
        supplier: 'Silverleaf Grove',
        purity: '98.1%',
        rarity: 'Uncommon',
      },
      {
        name: 'Phoenix Feather Ash',
        category: 'Ethereal Ash',
        currentStock: 18,
        unit: 'pinches',
        minThreshold: 30,
        costPerUnit: 140.0,
        leadTimeDays: 7,
        supplier: 'Solaris Aviary',
        purity: '100%',
        rarity: 'Mythic',
      },
      {
        name: 'Mandragora Root Essence',
        category: 'Botanical Extracts',
        currentStock: 95,
        unit: 'vials',
        minThreshold: 40,
        costPerUnit: 32.0,
        leadTimeDays: 3,
        supplier: 'Howling Vale Botanicals',
        purity: '96.5%',
        rarity: 'Rare',
      },
      {
        name: 'Abyssal Pearl Dust',
        category: 'Mineral & Scales',
        currentStock: 25,
        unit: 'drams',
        minThreshold: 35,
        costPerUnit: 115.0,
        leadTimeDays: 6,
        supplier: 'Trench Diver Guild',
        purity: '97.8%',
        rarity: 'Rare',
      },
      {
        name: 'Glow-Spore Mycelium',
        category: 'Botanical Extracts',
        currentStock: 310,
        unit: 'grams',
        minThreshold: 100,
        costPerUnit: 8.25,
        leadTimeDays: 2,
        supplier: 'Underdark Cultivators',
        purity: '95.0%',
        rarity: 'Common',
      },
      {
        name: 'Ectoplasmic Resin',
        category: 'Ethereal Ash',
        currentStock: 14,
        unit: 'fl. oz',
        minThreshold: 45,
        costPerUnit: 65.0,
        leadTimeDays: 4,
        supplier: 'Hallowed Crypt Distillers',
        purity: '91.2%',
        rarity: 'Rare',
      },
      {
        name: 'Starlight Nectar',
        category: 'Celestial Liquids',
        currentStock: 140,
        unit: 'fl. oz',
        minThreshold: 50,
        costPerUnit: 48.0,
        leadTimeDays: 4,
        supplier: 'Astral Observatory',
        purity: '99.9%',
        rarity: 'Legendary',
      },
    ];

    const savedIngredients = await Ingredient.insertMany(rawIngredients);
    const ingMap = {};
    savedIngredients.forEach((ing) => {
      ingMap[ing.name] = ing;
    });

    // 2. Inscribe Potions & Recipes
    const potions = [
      {
        name: 'Elixir of Astral Clarity',
        tier: 'Tier III Grand Master',
        price: 380.0,
        description: 'Heightens arcane cognition and allows glimpse into parallel timelines.',
        recipe: [
          { ingredient: ingMap['Moonlit Dewdrops']._id, ingredientName: 'Moonlit Dewdrops', quantity: 4, unit: 'fl. oz' },
          { ingredient: ingMap['Starlight Nectar']._id, ingredientName: 'Starlight Nectar', quantity: 2, unit: 'fl. oz' },
          { ingredient: ingMap['Dragon Scale Powder']._id, ingredientName: 'Dragon Scale Powder', quantity: 1, unit: 'drams' },
        ],
      },
      {
        name: 'Phoenix Rebirth Draught',
        tier: 'Tier IV Supreme',
        price: 850.0,
        description: 'Instantly reverses cellular entropy and restores vigor after grave peril.',
        recipe: [
          { ingredient: ingMap['Phoenix Feather Ash']._id, ingredientName: 'Phoenix Feather Ash', quantity: 2, unit: 'pinches' },
          { ingredient: ingMap['Mandragora Root Essence']._id, ingredientName: 'Mandragora Root Essence', quantity: 3, unit: 'vials' },
          { ingredient: ingMap['Dragon Scale Powder']._id, ingredientName: 'Dragon Scale Powder', quantity: 2, unit: 'drams' },
        ],
      },
      {
        name: 'Nocturnal Sight Philter',
        tier: 'Tier I Apprentice',
        price: 95.0,
        description: 'Grants piercing vision through magical darkness and thick fog.',
        recipe: [
          { ingredient: ingMap['Glow-Spore Mycelium']._id, ingredientName: 'Glow-Spore Mycelium', quantity: 15, unit: 'grams' },
          { ingredient: ingMap['Moonlit Dewdrops']._id, ingredientName: 'Moonlit Dewdrops', quantity: 3, unit: 'fl. oz' },
        ],
      },
      {
        name: "Tidecaller's Ward Potion",
        tier: 'Tier II Adept',
        price: 260.0,
        description: 'Surrounds the bearer in hydrostatic shields capable of dampening kinetic blasts.',
        recipe: [
          { ingredient: ingMap['Abyssal Pearl Dust']._id, ingredientName: 'Abyssal Pearl Dust', quantity: 3, unit: 'drams' },
          { ingredient: ingMap['Ectoplasmic Resin']._id, ingredientName: 'Ectoplasmic Resin', quantity: 2, unit: 'fl. oz' },
        ],
      },
    ];

    const savedPotions = await Potion.insertMany(potions);

    // 3. Generate 14 Days of Synthetic Historical Stock Movements & Sales
    const now = new Date();
    const movementsToInsert = [];
    const salesToInsert = [];

    // Initial cataloging movements
    savedIngredients.forEach((ing) => {
      movementsToInsert.push({
        ingredient: ing._id,
        ingredientName: ing.name,
        type: 'INITIAL_INVENTORY',
        quantityChange: ing.currentStock + 50,
        unit: ing.unit,
        previousStock: 0,
        newStock: ing.currentStock + 50,
        timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        reason: 'Primordial Sanctum stocking',
      });
    });

    const customers = [
      { name: 'Archmage Valerius', guild: 'Arcane Order of Oakhaven' },
      { name: 'Ranger Lyra Swiftarrow', guild: 'Midnight Wardens' },
      { name: 'High Paladin Gerald', guild: 'Solar Sunforged' },
      { name: 'Captain Bran', guild: 'Saltmarsh Syndicate' },
      { name: 'Sorceress Vespera', guild: 'Coven of the Crimson Veil' },
    ];

    // Generate daily sales and consumptions for past 14 days
    for (let dayOffset = 14; dayOffset >= 1; dayOffset--) {
      const dayDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      const salesPerDay = 1 + (dayOffset % 3);

      for (let s = 0; s < salesPerDay; s++) {
        const potion = savedPotions[s % savedPotions.length];
        const cust = customers[(dayOffset + s) % customers.length];
        const qty = 1 + (s % 2);
        const saleId = `TXN-${8800 + dayOffset * 10 + s}`;

        const consumedDeductions = [];

        potion.recipe.forEach((rec) => {
          const deductionQty = rec.quantity * qty;
          movementsToInsert.push({
            ingredient: rec.ingredient,
            ingredientName: rec.ingredientName,
            type: 'SALE_CONSUMPTION',
            quantityChange: -deductionQty,
            unit: rec.unit,
            previousStock: 100,
            newStock: 100 - deductionQty,
            referenceId: saleId,
            reason: `Historical dispensation: ${qty}x ${potion.name}`,
            timestamp: dayDate,
          });

          consumedDeductions.push({
            ingredient: rec.ingredient,
            ingredientName: rec.ingredientName,
            quantityDeducted: deductionQty,
            unit: rec.unit,
          });
        });

        salesToInsert.push({
          saleId,
          potion: potion._id,
          potionName: potion.name,
          quantity: qty,
          totalPrice: potion.price * qty,
          customer: cust.name,
          guild: cust.guild,
          consumedIngredients: consumedDeductions,
          timestamp: dayDate,
        });
      }
    }

    await StockMovement.insertMany(movementsToInsert);
    await Sale.insertMany(salesToInsert);

    // 4. Inscribe Active Seasonal Event (Midnight Curse)
    const bloodMoon = new SeasonalEvent({
      name: 'Blood Moon Necrotic Surge',
      code: 'BLOOD_MOON',
      multiplier: 1.75,
      startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      affectedIngredients: [
        ingMap['Dragon Scale Powder']._id,
        ingMap['Ectoplasmic Resin']._id,
        ingMap['Phoenix Feather Ash']._id,
      ],
      affectedCategories: ['Mineral & Scales', 'Ethereal Ash'],
      description: 'Under the Halloween full moon, necrotic atmospheric pressure accelerates consumption by +75%.',
      isActive: true,
    });
    await bloodMoon.save();

    // 5. Inscribe Realistic Strange Happenings
    const anomalies = [
      {
        title: 'Abnormal Ectoplasmic Dissipation',
        ingredient: ingMap['Ectoplasmic Resin']._id,
        ingredientName: 'Ectoplasmic Resin',
        type: 'SPECTRAL_LEAKAGE',
        severity: 'CRITICAL',
        zScore: 3.8,
        observedValue: 12.0,
        expectedValue: 3.5,
        unit: 'fl. oz',
        explanation: 'Vault B ethereal condensation seal ruptured. Depletion velocity is 380% higher than logged recipe consumption.',
        recommendedAction: 'Apply Seal of Severance and cast immediate restock spell.',
        status: 'ACTIVE',
        detectedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        title: 'Wyrmfang Dragon Scale Deficit',
        ingredient: ingMap['Dragon Scale Powder']._id,
        ingredientName: 'Dragon Scale Powder',
        type: 'RAPID_DEPLETION',
        severity: 'HIGH',
        observedValue: 42,
        expectedValue: 50,
        unit: 'drams',
        explanation: 'Current stock is 42 drams against minimum safe threshold of 50 drams. Supplier delayed due to mountain blizzard.',
        recommendedAction: 'Invoke emergency courier or allocate available powder to high-margin clarities.',
        status: 'ACTIVE',
        detectedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
      {
        title: 'Phoenix Ash Moisture Fluctuation',
        ingredient: ingMap['Phoenix Feather Ash']._id,
        ingredientName: 'Phoenix Feather Ash',
        type: 'SPOILAGE_ANOMALY',
        severity: 'MEDIUM',
        zScore: 2.1,
        observedValue: 4,
        expectedValue: 2,
        unit: 'pinches',
        explanation: 'Cinder canister ambient temperature dropped 4°C below ignition baseline.',
        recommendedAction: 'Heated runes recalibrated by Pyromancer in charge.',
        status: 'RESOLVED',
        resolvedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        resolutionNote: 'Thermal balance restored via heated charcoal runes.',
        detectedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      },
    ];

    await Anomaly.insertMany(anomalies);

    console.log('✨ Synthetic historical dataset successfully seeded into MongoDB Atlas & Mongoose!');
    return {
      message: 'Synthetic historical dataset successfully populated.',
      ingredientsCount: savedIngredients.length,
      potionsCount: savedPotions.length,
      salesCount: salesToInsert.length,
      stockMovementsCount: movementsToInsert.length,
    };
  }
}

