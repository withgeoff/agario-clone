// Polyfill for global object in browser environment
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}