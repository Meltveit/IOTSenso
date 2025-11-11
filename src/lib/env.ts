/**
 * Environment variable validation and type-safe access
 *
 * This file validates all required environment variables at application startup.
 * If any required variables are missing or invalid, the application will throw an error.
 */

import { z } from 'zod';

// Schema for client-side environment variables (NEXT_PUBLIC_*)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase Project ID is required'),
});

// Schema for server-side environment variables
const serverEnvSchema = z.object({
  // Firebase Admin
  FIREBASE_CLIENT_EMAIL: z.string().email('Firebase client email must be valid'),
  FIREBASE_PRIVATE_KEY: z.string().min(1, 'Firebase private key is required'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, 'Stripe secret key is required'),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // MQTT/HiveMQ
  HIVEMQ_URL: z.string().min(1, 'HiveMQ URL is required'),
  HIVEMQ_PORT: z.string().regex(/^\d+$/, 'HiveMQ port must be a number').transform(Number),
  HIVEMQ_USERNAME: z.string().min(1, 'HiveMQ username is required'),
  HIVEMQ_PASSWORD: z.string().min(1, 'HiveMQ password is required'),

  // Gemini AI
  GEMINI_API_KEY: z.string().min(1, 'Gemini API key is required'),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Merge schemas for server-side validation
const envSchema = serverEnvSchema.merge(clientEnvSchema);

/**
 * Validates environment variables
 * Call this at application startup to ensure all required env vars are present
 */
export function validateEnv() {
  try {
    // In browser, only validate client-side env vars
    if (typeof window !== 'undefined') {
      return clientEnvSchema.parse({
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }

    // On server, validate all env vars
    return envSchema.parse({
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      HIVEMQ_URL: process.env.HIVEMQ_URL,
      HIVEMQ_PORT: process.env.HIVEMQ_PORT,
      HIVEMQ_USERNAME: process.env.HIVEMQ_USERNAME,
      HIVEMQ_PASSWORD: process.env.HIVEMQ_PASSWORD,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `  - ${err.path.join('.')}: ${err.message}`).join('\n');
      throw new Error(
        `❌ Invalid environment variables:\n${missingVars}\n\nPlease check your .env file.`
      );
    }
    throw error;
  }
}

// Type-safe environment variables (server-side only)
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Get a type-safe environment variable
 * Only use this on the server side!
 */
export function getServerEnv(): ServerEnv & ClientEnv {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() can only be called on the server side');
  }
  return validateEnv() as ServerEnv & ClientEnv;
}

/**
 * Get client-side environment variables
 * Safe to use in browser
 */
export function getClientEnv(): ClientEnv {
  return {
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  };
}
