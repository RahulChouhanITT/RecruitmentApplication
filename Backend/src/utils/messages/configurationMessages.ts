export const CONFIGURATION_MESSAGES = {
  CLOUDINARY: {
    INITIALIZED: 'Cloudinary initialized',
    NOT_INITIALIZED: 'Cloudinary not initialized: missing CLOUDINARY_* environment variables',
  },
  ENVIRONMENT: {
    MISSING_REQUIRED_VARIABLE: (key: string) => `Missing required environment variable: ${key}`,
    INVALID_NUMERIC_VARIABLE: (key: string) => `Invalid numeric environment variable: ${key}`,
  },
} as const;
