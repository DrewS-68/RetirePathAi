/**
 * Performance monitoring and optimization utilities for RetirePath
 */

/**
 * Debounce function to limit how often a function can fire
 * Useful for search inputs, scroll handlers, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution rate
 * Useful for scroll handlers, resize handlers, etc.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Measure and log the execution time of a function
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    console.log(`⚡ Performance: ${name} took ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`❌ Performance: ${name} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}

/**
 * Create a memoized version of a function (simple cache)
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Create a memoized version with expiration
 */
export function memoizeWithTTL<T extends (...args: any[]) => any>(
  fn: T,
  ttlMs: number = 5 * 60 * 1000 // 5 minutes default
): T {
  const cache = new Map<string, { value: ReturnType<T>; expires: number }>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const now = Date.now();
    
    const cached = cache.get(key);
    if (cached && cached.expires > now) {
      return cached.value;
    }

    const result = fn(...args);
    cache.set(key, { value: result, expires: now + ttlMs });
    
    // Clean up expired entries
    for (const [k, v] of cache.entries()) {
      if (v.expires <= now) {
        cache.delete(k);
      }
    }

    return result;
  }) as T;
}

/**
 * Lazy load an image and return a promise
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Batch multiple image preloads
 */
export async function preloadImages(srcs: string[]): Promise<void> {
  await Promise.all(srcs.map(preloadImage));
}

/**
 * Check if user has reduced motion preference
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics() {
  if (!window.performance) {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigation) {
    return null;
  }

  return {
    // Page load metrics
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    domInteractive: navigation.domInteractive - navigation.fetchStart,
    
    // Network metrics
    dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcpConnection: navigation.connectEnd - navigation.connectStart,
    requestTime: navigation.responseEnd - navigation.requestStart,
    
    // Resource timing
    totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
  };
}

/**
 * Log performance metrics to console (dev only)
 */
export function logPerformanceMetrics() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      const metrics = getPerformanceMetrics();
      if (metrics) {
        console.group('⚡ Performance Metrics');
        console.log('DOM Content Loaded:', `${metrics.domContentLoaded.toFixed(2)}ms`);
        console.log('Load Complete:', `${metrics.loadComplete.toFixed(2)}ms`);
        console.log('DOM Interactive:', `${metrics.domInteractive.toFixed(2)}ms`);
        console.log('Total Load Time:', `${metrics.totalLoadTime.toFixed(2)}ms`);
        console.groupEnd();
      }
    }, 0);
  });
}

/**
 * Create a singleton instance (useful for expensive objects)
 */
export function singleton<T>(factory: () => T): () => T {
  let instance: T | null = null;

  return () => {
    if (instance === null) {
      instance = factory();
    }
    return instance;
  };
}

/**
 * Request idle callback wrapper with fallback
 */
export function requestIdleCallback(
  callback: () => void,
  options?: { timeout?: number }
): number {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    return setTimeout(callback, 1) as unknown as number;
  }
}

/**
 * Cancel idle callback with fallback
 */
export function cancelIdleCallback(id: number): void {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

// Initialize performance logging in development
if (typeof window !== 'undefined') {
  logPerformanceMetrics();
}
