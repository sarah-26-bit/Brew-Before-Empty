import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema(
  {
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true,
      index: true,
    },
    ingredientName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'SALE_CONSUMPTION',
        'RESTOCK',
        'MANUAL_ADJUSTMENT',
        'SPOILAGE_DISCARD',
        'SEASONAL_SURGE_DECAY',
        'INITIAL_INVENTORY',
      ],
      index: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
      min: 0,
    },
    newStock: {
      type: Number,
      required: true,
      min: 0,
    },
    referenceId: {
      type: String,
      index: true,
    },
    reason: {
      type: String,
      trim: true,
    },
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

// Compound index for time-series aggregation on an ingredient
stockMovementSchema.index({ ingredient: 1, timestamp: -1 });

export const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
