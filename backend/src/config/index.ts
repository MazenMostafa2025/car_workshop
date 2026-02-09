import dotenv from 'dotenv';
import path from 'path';
import { envSchema, type EnvConfig } from './env.validation';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Validate and parse environment variables.
 * Throws a descriptive error and exits if validation fails.
 */
function loadConfig(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}

/**
 * Application configuration — validated, typed, and frozen.
 * Import this anywhere: `import { config } from '@config';`
 */
export const config = Object.freeze(loadConfig());

/**
 * Derived helpers
 */
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';
