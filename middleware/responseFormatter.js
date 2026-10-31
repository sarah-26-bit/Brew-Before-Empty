/**
 * Standard API response formatter middleware
 * Ensures consistent JSON response structure across web and mobile consumers
 */
export function successResponse(res, data, message = null, statusCode = 200, meta = {}) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      ...meta,
    },
  });
}
