import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      trim: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
      enum: [
        'Mineral & Scales',
        'Celestial Liquids',
        'Ethereal Ash',
        'Botanical Extracts',
        'Necrotic Essence',
        'General Reagents',
      ],
      default: 'General Reagents',
    },
    currentStock: {
      type: Number,
      required: [true, 'Current stock quantity is required'],
      min: [0, 'Current stock cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      required: [true, 'Unit of measure is required'],
      trim: true,
      default: 'drams',
    },
    minThreshold: {
      type: Number,
      required: [true, 'Minimum threshold is required'],
      min: [0, 'Minimum threshold cannot be negative'],
      default: 20,
    },
    costPerUnit: {
      type: Number,
      min: [0, 'Cost per unit cannot be negative'],
      default: 10.0,
    },
    leadTimeDays: {
      type: Number,
      min: [1, 'Lead time must be at least 1 day'],
      default: 3,
    },
    supplier: {
      type: String,
      trim: true,
      default: 'Alchemical Guild',
    },
    purity: {
      type: String,
      trim: true,
      default: '98.5%',
    },
    rarity: {
      type: String,
      enum: ['Common', 'Uncommon', 'Rare', 'Legendary', 'Mythic'],
      default: 'Common',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for low stock warning
ingredientSchema.virtual('isLowStock').get(function () {
  return this.currentStock <= this.minThreshold;
});

// Virtual for stock status
ingredientSchema.virtual('stockStatus').get(function () {
  if (this.currentStock <= 0) return 'OUT_OF_STOCK';
  if (this.currentStock <= this.minThreshold * 0.5) return 'CRITICAL';
  if (this.currentStock <= this.minThreshold) return 'LOW';
  return 'HEALTHY';
});

export const Ingredient = mongoose.model('Ingredient', ingredientSchema);
