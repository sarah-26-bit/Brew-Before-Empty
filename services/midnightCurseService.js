import { SeasonalEvent } from '../models/SeasonalEvent.js';
import { Ingredient } from '../models/Ingredient.js';

export class MidnightCurseService {
  /**
   * Register a new seasonal event / curse surge
   */
  static async registerEvent(data) {
    const event = new SeasonalEvent(data);
    await event.save();
    return event;
  }

  /**
   * Get all registered seasonal events
   */
  static async getEvents() {
    return SeasonalEvent.find().populate('affectedIngredients').sort({ startDate: -1 });
  }

  /**
   * Get all currently active events
   */
  static async getActiveEvents() {
    const now = new Date();
    return SeasonalEvent.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).populate('affectedIngredients');
  }

  /**
   * Resolve compound multiplier for a specific ingredient
   * Considers active events affecting this ingredient specifically or by category or all
   */
  static async getIngredientMultiplier(ingredientId, category = null) {
    const activeEvents = await this.getActiveEvents();
    if (!activeEvents || activeEvents.length === 0) {
      return { multiplier: 1.0, activeEvents: [] };
    }

    let maxMultiplier = 1.0;
    const applicableEvents = [];

    for (const event of activeEvents) {
      const affectsSpecific = event.affectedIngredients.some(
        (ing) => ing._id.toString() === ingredientId.toString()
      );
      const affectsCategory = category && event.affectedCategories?.includes(category);
      const affectsAll = (!event.affectedIngredients || event.affectedIngredients.length === 0) &&
                         (!event.affectedCategories || event.affectedCategories.length === 0);

      if (affectsSpecific || affectsCategory || affectsAll) {
        if (event.multiplier > maxMultiplier) {
          maxMultiplier = event.multiplier;
        }
        applicableEvents.push({
          id: event._id,
          name: event.name,
          multiplier: event.multiplier,
          description: event.description,
        });
      }
    }

    return {
      multiplier: maxMultiplier,
      activeEvents: applicableEvents,
    };
  }

  /**
   * Toggle event active status
   */
  static async toggleEvent(id, isActive) {
    const event = await SeasonalEvent.findById(id);
    if (!event) {
      const err = new Error('Seasonal event not found');
      err.statusCode = 404;
      throw err;
    }
    event.isActive = isActive !== undefined ? isActive : !event.isActive;
    await event.save();
    return event;
  }
}

