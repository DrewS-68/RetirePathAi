// Input validation schemas using Zod
import { z } from 'npm:zod@3';

// ============================================
// USER & AUTH VALIDATION
// ============================================

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  membershipTier: z.enum(['free', 'premium', 'family']).optional().default('free'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^(?:\+?61|0)[2-478]\d{8}$/, 'Invalid Australian phone number').optional(),
  dateOfBirth: z.string().datetime().optional(),
});

// ============================================
// REVIEW VALIDATION
// ============================================

export const reviewSchema = z.object({
  village_id: z.string().uuid('Invalid village ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  comment: z.string().min(20, 'Comment must be at least 20 characters').max(2000, 'Comment too long'),
  experience_type: z.enum(['resident', 'family', 'visitor', 'staff']).optional(),
  stayed_duration: z.string().max(50).optional(),
});

export const reviewUpdateSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  comment: z.string().min(20).max(2000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export const reviewModerationSchema = z.object({
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters').max(500).optional(),
});

// ============================================
// VILLAGE VALIDATION
// ============================================

export const villageSearchSchema = z.object({
  state: z.string().length(3, 'State must be 3 characters (e.g., NSW)').optional(),
  suburb: z.string().min(2).max(100).optional(),
  operator: z.string().min(2).max(100).optional(),
  careType: z.enum(['independent', 'assisted', 'aged-care', 'memory-care']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export const villageSubmissionSchema = z.object({
  name: z.string().min(3, 'Village name must be at least 3 characters').max(200),
  operator: z.string().min(2).max(200),
  street_address: z.string().min(5).max(300),
  suburb: z.string().min(2).max(100),
  state: z.enum(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']),
  postcode: z.string().regex(/^\d{4}$/, 'Postcode must be 4 digits'),
  phone: z.string().regex(/^(?:\+?61|0)[2-478]\d{8}$/, 'Invalid Australian phone number').optional(),
  email: z.string().email('Invalid email address').optional(),
  website: z.string().url('Invalid website URL').optional(),
  description: z.string().min(50).max(2000).optional(),
  care_types: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
});

export const villageUpdateSchema = villageSubmissionSchema.partial();

// ============================================
// AGENT LEAD VALIDATION
// ============================================

export const agentLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^(?:\+?61|0)[2-478]\d{8}$/, 'Invalid Australian phone number'),
  suburb: z.string().min(2).max(100),
  state: z.enum(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']),
  postcode: z.string().regex(/^\d{4}$/, 'Postcode must be 4 digits'),
  propertyType: z.enum(['house', 'apartment', 'townhouse', 'unit', 'other']),
  estimatedValue: z.number().min(0).max(100000000).optional(),
  timeframe: z.enum(['urgent', '1-3-months', '3-6-months', '6-12-months', 'not-sure']),
  message: z.string().max(1000).optional(),
});

// ============================================
// ISSUE REPORT VALIDATION
// ============================================

export const issueReportSchema = z.object({
  village_id: z.string().uuid('Invalid village ID'),
  issue_type: z.enum([
    'incorrect-info',
    'outdated-info',
    'duplicate',
    'inappropriate-content',
    'missing-info',
    'other'
  ]),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000),
  reporter_email: z.string().email('Invalid email address').optional(),
});

// ============================================
// PAYMENT VALIDATION
// ============================================

export const checkoutSessionSchema = z.object({
  membershipTier: z.enum(['premium', 'family']),
  duration: z.number().int().refine((val) => [1, 3, 6].includes(val), {
    message: 'Duration must be 1, 3, or 6 months'
  }),
  amount: z.number().min(1, 'Amount must be positive'),
});

// ============================================
// ANALYTICS VALIDATION
// ============================================

export const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  metric: z.enum([
    'signups',
    'conversions',
    'revenue',
    'searches',
    'reviews',
    'village-views'
  ]).optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
});

// ============================================
// TOUR BOOKING VALIDATION
// ============================================

export const tourBookingSchema = z.object({
  village_id: z.string().uuid('Invalid village ID'),
  name: z.string().min(2).max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^(?:\+?61|0)[2-478]\d{8}$/, 'Invalid Australian phone number'),
  preferred_date: z.string().datetime('Invalid date format'),
  preferred_time: z.enum(['morning', 'afternoon', 'flexible']),
  num_people: z.number().int().min(1).max(10),
  message: z.string().max(500).optional(),
});

// ============================================
// OPERATOR DASHBOARD VALIDATION
// ============================================

export const operatorClaimSchema = z.object({
  village_id: z.string().uuid('Invalid village ID'),
  business_name: z.string().min(2).max(200),
  contact_name: z.string().min(2).max(100),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string().regex(/^(?:\+?61|0)[2-478]\d{8}$/, 'Invalid Australian phone number'),
  abn: z.string().regex(/^\d{11}$/, 'ABN must be 11 digits').optional(),
  proof_document: z.string().optional(), // URL to uploaded proof
});

export const villageImageUploadSchema = z.object({
  village_id: z.string().uuid('Invalid village ID'),
  caption: z.string().max(200).optional(),
  display_order: z.number().int().min(0).optional(),
});

// ============================================
// HELPER FUNCTION
// ============================================

/**
 * Validate data against a Zod schema
 * Returns parsed data or throws error with details
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      throw {
        type: 'validation_error',
        errors: formattedErrors,
        message: 'Invalid input data'
      };
    }
    throw error;
  }
}

/**
 * Safe validation that returns result object instead of throwing
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; errors: Array<{ field: string; message: string }> } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return { success: false, errors: formattedErrors };
    }
    return { 
      success: false, 
      errors: [{ field: 'unknown', message: 'Validation failed' }] 
    };
  }
}
