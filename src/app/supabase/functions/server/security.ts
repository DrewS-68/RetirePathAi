// Security utilities for RetirePath
import { Context } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// ============================================
// RATE LIMITING
// ============================================

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix: string;
}

/**
 * Rate limiter middleware
 * Prevents abuse by limiting requests per IP/user
 */
export async function rateLimit(config: RateLimitConfig) {
  return async (c: Context, next: () => Promise<void>) => {
    // Get identifier (IP address or user ID)
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    let identifier = ip;
    
    // If user is authenticated, use their user ID for more accurate tracking
    if (accessToken) {
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      if (user) {
        identifier = user.id;
      }
    }

    const key = `${config.keyPrefix}:${identifier}`;
    const now = Date.now();

    // Get existing rate limit data
    const rateLimitData = await kv.get(key) as { count: number; resetAt: number } | null;

    if (rateLimitData) {
      // Check if window has expired
      if (now > rateLimitData.resetAt) {
        // Reset the counter
        await kv.set(key, { count: 1, resetAt: now + config.windowMs });
      } else if (rateLimitData.count >= config.maxRequests) {
        // Rate limit exceeded
        const retryAfter = Math.ceil((rateLimitData.resetAt - now) / 1000);
        return c.json(
          { 
            error: 'Rate limit exceeded. Please try again later.',
            retryAfter: retryAfter
          },
          429,
          {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitData.resetAt).toISOString(),
          }
        );
      } else {
        // Increment counter
        await kv.set(key, { 
          count: rateLimitData.count + 1, 
          resetAt: rateLimitData.resetAt 
        });
      }
    } else {
      // First request in window
      await kv.set(key, { count: 1, resetAt: now + config.windowMs });
    }

    await next();
  };
}

// Pre-configured rate limiters for different endpoints
export const rateLimiters = {
  // Strict rate limit for authentication endpoints
  auth: rateLimit({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'ratelimit:auth'
  }),
  
  // Moderate rate limit for API endpoints
  api: rateLimit({
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'ratelimit:api'
  }),
  
  // Strict rate limit for review submissions
  reviews: rateLimit({
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'ratelimit:reviews'
  }),
  
  // Moderate rate limit for search/read operations
  search: rateLimit({
    maxRequests: 200,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'ratelimit:search'
  }),

  // Strict rate limit for payment operations
  payment: rateLimit({
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'ratelimit:payment'
  }),
};

// ============================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================

/**
 * Check if a user has admin role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const role = await kv.get(`user:${userId}:role`) as string | null;
    return role === 'admin';
  } catch (error) {
    console.error(`Error checking admin role for user ${userId}:`, error);
    return false;
  }
}

/**
 * Check if a user has operator role
 */
export async function isOperator(userId: string): Promise<boolean> {
  try {
    const role = await kv.get(`user:${userId}:role`) as string | null;
    return role === 'operator' || role === 'admin'; // Admins can also be operators
  } catch (error) {
    console.error(`Error checking operator role for user ${userId}:`, error);
    return false;
  }
}

/**
 * Set user role
 */
export async function setUserRole(userId: string, role: 'admin' | 'operator' | 'member'): Promise<void> {
  await kv.set(`user:${userId}:role`, role);
  console.log(`User ${userId} role set to: ${role}`);
}

/**
 * Middleware to require admin access
 */
export async function requireAdmin(c: Context, next: () => Promise<void>) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  
  if (authError || !user) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  const hasAdminRole = await isAdmin(user.id);
  
  if (!hasAdminRole) {
    console.log(`Access denied: User ${user.id} attempted to access admin endpoint`);
    return c.json({ 
      error: 'Forbidden - Admin access required',
      message: 'You do not have permission to access this resource'
    }, 403);
  }

  // Store user in context for use in route handler
  c.set('user', user);
  await next();
}

/**
 * Middleware to require operator access
 */
export async function requireOperator(c: Context, next: () => Promise<void>) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  
  if (authError || !user) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  const hasOperatorRole = await isOperator(user.id);
  
  if (!hasOperatorRole) {
    console.log(`Access denied: User ${user.id} attempted to access operator endpoint`);
    return c.json({ 
      error: 'Forbidden - Operator access required',
      message: 'You do not have permission to access this resource'
    }, 403);
  }

  c.set('user', user);
  await next();
}

// ============================================
// XSS PROTECTION
// ============================================

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes dangerous tags and attributes
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove object and embed tags
  sanitized = sanitized.replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
  
  return sanitized.trim();
}

/**
 * Sanitize text input (removes all HTML)
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  // Remove all HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities to prevent double-encoding attacks
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&');
  
  // Remove any remaining HTML
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  return sanitized.trim();
}

// ============================================
// INPUT VALIDATION HELPERS
// ============================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate Australian phone number
 */
export function isValidAustralianPhone(phone: string): boolean {
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Check for valid Australian phone format
  // Mobile: 04xx xxx xxx
  // Landline: (02|03|07|08) xxxx xxxx
  const mobileRegex = /^(?:\+?61|0)4\d{8}$/;
  const landlineRegex = /^(?:\+?61|0)[2378]\d{8}$/;
  
  return mobileRegex.test(cleaned) || landlineRegex.test(cleaned);
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check against common passwords
  const commonPasswords = [
    'password', '12345678', 'qwerty', 'abc123', 'password1', 
    'Password1', 'Welcome1', 'admin123', 'letmein'
  ];
  
  if (commonPasswords.includes(password)) {
    errors.push('Password is too common. Please choose a stronger password');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================
// SECURITY LOGGING
// ============================================

export interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit' | 'invalid_input' | 'unauthorized_access' | 'suspicious_activity';
  userId?: string;
  ip?: string;
  endpoint: string;
  details: string;
  timestamp: string;
}

/**
 * Log security events for monitoring
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    const key = `security:log:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(key, event);
    
    // Also log to console for immediate visibility
    console.log(`🚨 SECURITY EVENT: ${event.type} - ${event.endpoint} - ${event.details}`);
    
    // If critical event, you could also send an alert (email, Slack, etc.)
    if (event.type === 'unauthorized_access' || event.type === 'suspicious_activity') {
      console.error(`⚠️ CRITICAL SECURITY EVENT: ${JSON.stringify(event)}`);
    }
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

/**
 * Get recent security events (for admin dashboard)
 */
export async function getSecurityEvents(limit: number = 100): Promise<SecurityEvent[]> {
  try {
    const events = await kv.getByPrefix('security:log:') as SecurityEvent[];
    return events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching security events:', error);
    return [];
  }
}
