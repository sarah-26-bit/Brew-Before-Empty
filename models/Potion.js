import mongoose from 'mongoose';

const recipeItemSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      required: true,
      min: [0.01, 'Quantity must be greater than zero'],
    },
    unit: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const potionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Potion name is required'],
      trim: true,
      unique: true,
      index: true,
    },
    tier: {
      type: String,
      default: 'Tier II Adept',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
    },
    recipe: {
      type: [recipeItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A potion recipe must include at least one ingredient',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Potion = mongoose.model('Potion', potionSchema);

