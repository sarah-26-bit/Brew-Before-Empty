import mongoose from 'mongoose';

const consumedItemSchema = new mongoose.Schema(
  {
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true,
    },
    ingredientName: {
      type: String,
      required: true,
    },
    quantityDeducted: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    saleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    potion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Potion',
    },
    potionName: {
      type: String,
      required: [true, 'Potion name is required'],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity sold is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative'],
    },
    customer: {
      type: String,
      trim: true,
      default: 'Anonymous Mage',
    },
    guild: {
      type: String,
      trim: true,
      default: 'Independent',
    },
    consumedIngredients: [consumedItemSchema],
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Sale = mongoose.model('Sale', saleSchema);

