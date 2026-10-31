export function validateIngredient(req, res, next) {
  const { name, category, currentStock, unit, minThreshold } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push({ field: 'name', message: 'Valid ingredient name is required' });
  }

  if (currentStock !== undefined && (isNaN(currentStock) || Number(currentStock) < 0)) {
    errors.push({ field: 'currentStock', message: 'Current stock must be a non-negative number' });
  }

  if (minThreshold !== undefined && (isNaN(minThreshold) || Number(minThreshold) < 0)) {
    errors.push({ field: 'minThreshold', message: 'Minimum threshold must be a non-negative number' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid ingredient data provided',
      details: errors,
    });
  }

  next();
}

export function validateSale(req, res, next) {
  const { potionId, potionName, quantity } = req.body;
  const errors = [];

  if (!potionId && (!potionName || !potionName.trim())) {
    errors.push({ field: 'potion', message: 'Either potionId or potionName is required' });
  }

  if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
    errors.push({ field: 'quantity', message: 'Quantity must be a positive integer greater than zero' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid sale transaction request',
      details: errors,
    });
  }

  next();
}

export function validateSeasonalEvent(req, res, next) {
  const { name, multiplier, startDate, endDate } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push({ field: 'name', message: 'Event name is required' });
  }

  if (multiplier !== undefined && (isNaN(multiplier) || Number(multiplier) < 1.0)) {
    errors.push({ field: 'multiplier', message: 'Demand multiplier must be at least 1.0' });
  }

  if (!startDate || isNaN(new Date(startDate).getTime())) {
    errors.push({ field: 'startDate', message: 'Valid start date is required' });
  }

  if (!endDate || isNaN(new Date(endDate).getTime())) {
    errors.push({ field: 'endDate', message: 'Valid end date is required' });
  }

  if (new Date(startDate) > new Date(endDate)) {
    errors.push({ field: 'dates', message: 'Start date cannot be after end date' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid seasonal event data',
      details: errors,
    });
  }

  next();
}
