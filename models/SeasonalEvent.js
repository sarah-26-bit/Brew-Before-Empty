import mongoose from 'mongoose';

const seasonalEventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      unique: true,
      index: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    multiplier: {
      type: Number,
      required: [true, 'Demand multiplier is required'],
      min: [1.0, 'Multiplier must be at least 1.0'],
      default: 1.5,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    affectedIngredients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient',
      },
    ],
    affectedCategories: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to check if event is active right now
seasonalEventSchema.methods.isCurrentlyActive = function () {
  if (!this.isActive) return false;
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

export const SeasonalEvent = mongoose.model('SeasonalEvent', seasonalEventSchema);
