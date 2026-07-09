export const CONFIGURATION_CONSTANTS = {
  DEFAULTS: {
    FALSE: false,
    NULL: null,
    EMPTY_STRING: '',
    COMMA_SEPARATOR: ', ',
    SERVER_PORT: 5000,
  },
  TYPE_NAMES: {
    STRING: 'string',
    BOOLEAN: 'boolean',
  },
  ENVIRONMENTS: {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
  },
  ENVIRONMENT_VARIABLES: {
    NODE_ENV: 'NODE_ENV',
    APPLICATION_PORT: 'APPLICATION_PORT',
    MONGO_DATABASE_URL: 'MONGO_DATABASE_URL',
    FRONTEND_ORIGIN: 'FRONTEND_ORIGIN',
    JWT_SECRET_KEY: 'JWT_SECRET_KEY',
    GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID',
    GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET',
    GOOGLE_REDIRECT_URI: 'GOOGLE_REDIRECT_URI',
    GOOGLE_AUTH_REDIRECT_URI: 'GOOGLE_AUTH_REDIRECT_URI',
    GOOGLE_REFRESH_TOKEN: 'GOOGLE_REFRESH_TOKEN',
    GOOGLE_CALENDAR_ID: 'GOOGLE_CALENDAR_ID',
    SMTP_HOST: 'SMTP_HOST',
    SMTP_PORT: 'SMTP_PORT',
    SMTP_USER: 'SMTP_USER',
    SMTP_PASS: 'SMTP_PASS',
    SMTP_FROM_NAME: 'SMTP_FROM_NAME',
    SMTP_FROM_EMAIL: 'SMTP_FROM_EMAIL',
    CLOUDINARY_CLOUD_NAME: 'CLOUDINARY_CLOUD_NAME',
    CLOUDINARY_API_KEY: 'CLOUDINARY_API_KEY',
    CLOUDINARY_API_SECRET: 'CLOUDINARY_API_SECRET',
  },
  RATE_LIMIT: {
    KEY_PREFIXES: {
      GLOBAL_API: 'global-api',
      AUTH_WRITE: 'auth-write',
      AUTH_OTP: 'auth-otp',
    },
    HEADERS: {
      RETRY_AFTER: 'Retry-After',
      LIMIT: 'X-RateLimit-Limit',
      REMAINING: 'X-RateLimit-Remaining',
    },
    POLICIES: {
      GLOBAL_API: {
        maxRequests: 120,
        windowMs: 60 * 1000,
      },
      AUTH_WRITE: {
        maxRequests: 10,
        windowMs: 10 * 60 * 1000,
      },
      AUTH_OTP: {
        maxRequests: 5,
        windowMs: 10 * 60 * 1000,
      },
    },
  },
  SOCKET: {
    FRONTEND_ORIGIN: 'http://localhost:5173',
    PATH: '/api/socket.io',
    USER_ROOM_PREFIX: 'user:',
    SOCKET_TRANSPORT_ERROR_MESSAGE: 'Unauthorized',
    EVENTS: {
      CONNECTION: 'connection',
      DISCONNECT: 'disconnect',
      PRESENCE_CHANGED: 'presence:changed',
    },
  },
  SERVER: {
    ENV_PATH: '../../.env',
    START_MESSAGE_PREFIX: 'Server is running on port ',
  },
  EMAIL: {
    ENV_KEYS: {
      HOST: 'SMTP_HOST',
      PORT: 'SMTP_PORT',
      USER: 'SMTP_USER',
      PASS: 'SMTP_PASS',
    },
  },
  CLOUDINARY: {
    REQUIRED_ENV_PREFIX: 'CLOUDINARY_*',
  },
} as const;
