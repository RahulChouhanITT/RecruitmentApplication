import dotenv from 'dotenv';
import path from 'path';
import { CONFIGURATION_CONSTANTS } from '../utils/constants/configurationConstants';
import { CONFIGURATION_MESSAGES } from '../utils/messages/configurationMessages';

dotenv.config({ path: path.resolve(__dirname, CONFIGURATION_CONSTANTS.SERVER.ENV_PATH) });

const ENV = process.env;

const getRequiredEnv = (key: string): string => {
  const value = ENV[key]?.trim();
  if (!value) {
    throw new Error(CONFIGURATION_MESSAGES.ENVIRONMENT.MISSING_REQUIRED_VARIABLE(key));
  }
  return value;
};

const getOptionalEnv = (key: string): string | undefined => {
  const value = ENV[key]?.trim();
  return value ? value : undefined;
};

const getNumberEnv = (key: string, fallback?: number): number => {
  const value = ENV[key]?.trim();
  if (!value) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(CONFIGURATION_MESSAGES.ENVIRONMENT.MISSING_REQUIRED_VARIABLE(key));
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(CONFIGURATION_MESSAGES.ENVIRONMENT.INVALID_NUMERIC_VARIABLE(key));
  }

  return parsed;
};

const smtpPortValue = getOptionalEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.SMTP_PORT);

const appConfiguration = Object.freeze({
  nodeEnv:
    getOptionalEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.NODE_ENV) ??
    CONFIGURATION_CONSTANTS.ENVIRONMENTS.DEVELOPMENT,
  port: getNumberEnv(
    CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.APPLICATION_PORT,
    CONFIGURATION_CONSTANTS.DEFAULTS.SERVER_PORT,
  ),
  frontendOrigin:
    getOptionalEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.FRONTEND_ORIGIN) ??
    CONFIGURATION_CONSTANTS.SOCKET.FRONTEND_ORIGIN,
});

const databaseConfiguration = Object.freeze({
  mongoUri: getRequiredEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.MONGO_DATABASE_URL),
});

const authConfiguration = Object.freeze({
  jwtSecret: getRequiredEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.JWT_SECRET_KEY),
});

const googleConfiguration = Object.freeze({
  clientId: getOptionalEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.GOOGLE_CLIENT_ID),
  clientSecret: getOptionalEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.GOOGLE_CLIENT_SECRET),
  redirectUri: getOptionalEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.GOOGLE_REDIRECT_URI),
  authRedirectUri: getOptionalEnv(
    CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.GOOGLE_AUTH_REDIRECT_URI,
  ),
  refreshToken: getOptionalEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.GOOGLE_REFRESH_TOKEN),
  calendarId: getOptionalEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.GOOGLE_CALENDAR_ID),
});

const smtpConfiguration = Object.freeze({
  host: getOptionalEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.SMTP_HOST),
  port: smtpPortValue
    ? getNumberEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.SMTP_PORT)
    : undefined,
  user: getOptionalEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.SMTP_USER),
  pass: getOptionalEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.SMTP_PASS),
  fromName: getOptionalEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.SMTP_FROM_NAME),
  fromEmail: getOptionalEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.SMTP_FROM_EMAIL),
});

const cloudinaryConfiguration = Object.freeze({
  cloudName: getOptionalEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.CLOUDINARY_CLOUD_NAME),
  apiKey: getOptionalEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.CLOUDINARY_API_KEY),
  apiSecret: getOptionalEnv(CONFIGURATION_CONSTANTS.ENVIRONMENT_VARIABLES.CLOUDINARY_API_SECRET),
});

export const env = Object.freeze({
  app: appConfiguration,
  db: databaseConfiguration,
  auth: authConfiguration,
  google: googleConfiguration,
  smtp: smtpConfiguration,
  cloudinary: cloudinaryConfiguration,
  NODE_ENV: appConfiguration.nodeEnv,
  PORT: appConfiguration.port,
  FRONTEND_ORIGIN: appConfiguration.frontendOrigin,
  MONGO_URI: databaseConfiguration.mongoUri,
  JWT_SECRET: authConfiguration.jwtSecret,
  GOOGLE_CLIENT_ID: googleConfiguration.clientId,
  GOOGLE_CLIENT_SECRET: googleConfiguration.clientSecret,
  GOOGLE_REDIRECT_URI: googleConfiguration.redirectUri,
  GOOGLE_AUTH_REDIRECT_URI: googleConfiguration.authRedirectUri,
  GOOGLE_REFRESH_TOKEN: googleConfiguration.refreshToken,
  GOOGLE_CALENDAR_ID: googleConfiguration.calendarId,
  SMTP_HOST: smtpConfiguration.host,
  SMTP_PORT: smtpConfiguration.port,
  SMTP_USER: smtpConfiguration.user,
  SMTP_PASS: smtpConfiguration.pass,
  SMTP_FROM_NAME: smtpConfiguration.fromName,
  SMTP_FROM_EMAIL: smtpConfiguration.fromEmail,
  CLOUDINARY_CLOUD_NAME: cloudinaryConfiguration.cloudName,
  CLOUDINARY_API_KEY: cloudinaryConfiguration.apiKey,
  CLOUDINARY_API_SECRET: cloudinaryConfiguration.apiSecret,
} as const);

export type Env = typeof env;
