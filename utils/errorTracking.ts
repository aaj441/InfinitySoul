/**
 * Error Tracking - Stub for MVP deployment
 *
 * Simplified error tracking that allows the build to succeed.
 * Full Sentry integration will be added later.
 */

export function initErrorTracking() {
  console.log('[Error Tracking] Initialized (stub mode)');
}

export function captureException(error: Error, context?: any) {
  console.error('[Error Tracking] Exception captured:', error, context);
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console.log(`[Error Tracking] Message [${level}]:`, message);
}

export function setUser(user: { id: string; email?: string; username?: string }) {
  console.log('[Error Tracking] User set:', user);
}

export function addBreadcrumb(breadcrumb: { message: string; category?: string; level?: string; data?: any }) {
  console.log('[Error Tracking] Breadcrumb added:', breadcrumb);
}

export default {
  initErrorTracking,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb
};
