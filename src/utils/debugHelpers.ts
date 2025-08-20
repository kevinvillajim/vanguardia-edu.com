// Debug helpers to prevent "Cannot convert object to primitive value" errors

/**
 * Safely converts any value to string for debugging
 */
export const safeStringify = (value: any): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
};

/**
 * Safe error logging that won't cause primitive conversion errors
 */
export const safeLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data ? safeStringify(data) : '');
  }
};

/**
 * Safe error reporting
 */
export const safeError = (message: string, error?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, error ? safeStringify(error) : '');
  }
};

/**
 * Validates that a value can be safely used as a React child
 */
export const validateReactChild = (value: any): boolean => {
  const validTypes = ['string', 'number', 'boolean'];
  return value === null || value === undefined || validTypes.includes(typeof value);
};

/**
 * Ensures a value is safe to render in React
 */
export const ensureRenderSafe = (value: any): React.ReactNode => {
  if (validateReactChild(value)) {
    return value;
  }
  
  if (Array.isArray(value)) {
    return value.map(ensureRenderSafe);
  }
  
  // If it's an object, return null to prevent rendering errors
  return null;
};

export default {
  safeStringify,
  safeLog,
  safeError,
  validateReactChild,
  ensureRenderSafe
};