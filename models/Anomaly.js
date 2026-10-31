import mongoose from 'mongoose';

const anomalySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
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
        'CONSUMPTION_SPIKE',
        'UNEXPECTED_ADJUSTMENT',
        'RAPID_DEPLETION',
        'SPOILAGE_ANOMALY',
        'SPECTRAL_LEAKAGE',
        'CURSE_ANOMALY',
      ],
      index: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    zScore: {
      type: Number,
    },
    observedValue: {
      type: Number,
    },
    expectedValue: {
      type: Number,
    },
    unit: {
      type: String,
      default: 'units',
    },
    explanation: {
      type: String,
      required: true,
    },
    recommendedAction: {
      type: String,
      default: 'Inspect storage ward and rebalance inventory.',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RESOLVED'],
      default: 'ACTIVE',
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
    resolutionNote: {
      type: String,
    },
    detectedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Anomaly = mongoose.model('Anomaly', anomalySchema);

