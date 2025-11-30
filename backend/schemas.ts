/**
 * Input Validation Schemas (Zod)
 * "Defense in Depth" strategy for user inputs
 * Every request must conform to these schemas
 */

import { z } from 'zod';

// ============ SCAN REQUEST ============

export const ScanRequestSchema = z.object({
  url: z
    .string()
    .min(5, 'URL too short')
    .max(2048, 'URL too long')
    .url('Invalid URL format')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      'URL must use http:// or https:// protocol'
    ),
  email: z
    .string()
    .email('Invalid email format')
    .optional()
    .nullable()
});

export type ScanRequest = z.infer<typeof ScanRequestSchema>;

// ============ STRIPE WEBHOOK ============

export const StripeEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.any())
  }),
  created: z.number()
});

export type StripeEvent = z.infer<typeof StripeEventSchema>;

// ============ SONAR QUERY ============

export const SonarQuerySchema = z.object({
  violationCode: z
    .string()
    .min(3, 'Violation code too short')
    .max(50, 'Violation code too long')
    .regex(/^[a-z-]+$/, 'Violation code must be lowercase with hyphens'),
  violationDescription: z
    .string()
    .min(10, 'Description too short')
    .max(500, 'Description too long')
    .optional(),
  websiteUrl: z
    .string()
    .url('Invalid URL')
    .optional()
});

export type SonarQuery = z.infer<typeof SonarQuerySchema>;

// ============ SUBSCRIPTION CHECK ============

export const SubscriptionCheckSchema = z.object({
  customerId: z
    .string()
    .min(5, 'Customer ID too short')
    .max(100, 'Customer ID too long')
});

export type SubscriptionCheck = z.infer<typeof SubscriptionCheckSchema>;

// ============ ERROR RESPONSE ============

export const ErrorResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
  statusCode: z.number().optional(),
  timestamp: z.string()
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// ============ VALIDATION MIDDLEWARE ============

/**
 * Generic validation middleware
 * Pass schema, field to validate, and optional extraction path
 */
export function validate(schema: z.ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
  return (req: any, res: any, next: any) => {
    try {
      const data = source === 'body' ? req.body : source === 'params' ? req.params : req.query;

      const validated = schema.parse(data);

      // Replace with validated data
      if (source === 'body') req.body = validated;
      if (source === 'params') req.params = validated;
      if (source === 'query') req.query = validated;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message
          })),
          timestamp: new Date().toISOString()
        });
      }

      next(error);
    }
  };
}

// ============ SANITIZATION ============

/**
 * Remove dangerous characters and HTML tags
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"']/g, '') // Remove dangerous characters
    .trim();
}

/**
 * Sanitize all string fields in an object
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }

  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[key] = sanitizeObject(value);
      return acc;
    }, {} as any);
  }

  return obj;
}
