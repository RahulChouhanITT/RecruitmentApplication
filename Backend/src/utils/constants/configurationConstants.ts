export const CONFIGURATION_CONSTANTS = {
  DEFAULTS: {
    FALSE: false,
    NULL: null,
    EMPTY_STRING: "",
    COMMA_SEPARATOR: ", ",
    SERVER_PORT: 5000,
  },
  TYPE_NAMES: {
    STRING: "string",
    BOOLEAN: "boolean",
  },
  ENVIRONMENTS: {
    PRODUCTION: "production",
  },
  SOCKET: {
    FRONTEND_ORIGIN: "http://localhost:5173",
    USER_ROOM_PREFIX: "user:",
    SOCKET_TRANSPORT_ERROR_MESSAGE: "Unauthorized",
    EVENTS: {
      CONNECTION: "connection",
      DISCONNECT: "disconnect",
      PRESENCE_CHANGED: "presence:changed",
    },
  },
  SERVER: {
    ENV_PATH: "../../.env",
    START_MESSAGE_PREFIX: "Server is running on port ",
  },
  EMAIL: {
    ENV_KEYS: {
      HOST: "SMTP_HOST",
      PORT: "SMTP_PORT",
      USER: "SMTP_USER",
      PASS: "SMTP_PASS",
    },
  },
  CLOUDINARY: {
    REQUIRED_ENV_PREFIX: "CLOUDINARY_*",
  },
} as const;
