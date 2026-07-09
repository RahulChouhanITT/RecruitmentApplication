import nodemailer, { type Transporter } from 'nodemailer';
import { env } from './env';
import { APPLICATION_CONSTANTS } from '../utils/constants/applicationConstants';
import { CONFIGURATION_CONSTANTS } from '../utils/constants/configurationConstants';
import { APPLICATION_MESSAGES } from '../utils/messages/applicationMessages';

class EmailConfigurationManager {
  private static instance: EmailConfigurationManager;
  private transporter: Transporter | null = CONFIGURATION_CONSTANTS.DEFAULTS.NULL;

  private constructor() {}

  public static getInstance(): EmailConfigurationManager {
    if (!EmailConfigurationManager.instance) {
      EmailConfigurationManager.instance = new EmailConfigurationManager();
    }
    return EmailConfigurationManager.instance;
  }

  public getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const host = env.SMTP_HOST;
    const port = env.SMTP_PORT;
    const user = env.SMTP_USER;
    const pass = env.SMTP_PASS;

    if (!host || port === undefined || !user || !pass) {
      const missingKeys = [
        !host
          ? CONFIGURATION_CONSTANTS.EMAIL.ENV_KEYS.HOST
          : CONFIGURATION_CONSTANTS.DEFAULTS.EMPTY_STRING,
        port === undefined
          ? CONFIGURATION_CONSTANTS.EMAIL.ENV_KEYS.PORT
          : CONFIGURATION_CONSTANTS.DEFAULTS.EMPTY_STRING,
        !user
          ? CONFIGURATION_CONSTANTS.EMAIL.ENV_KEYS.USER
          : CONFIGURATION_CONSTANTS.DEFAULTS.EMPTY_STRING,
        !pass
          ? CONFIGURATION_CONSTANTS.EMAIL.ENV_KEYS.PASS
          : CONFIGURATION_CONSTANTS.DEFAULTS.EMPTY_STRING,
      ].filter(Boolean);

      throw new Error(
        `${APPLICATION_MESSAGES.EMAIL.SMTP_CONFIGURATION_MISSING}: ${missingKeys.join(CONFIGURATION_CONSTANTS.DEFAULTS.COMMA_SEPARATOR)}`,
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === APPLICATION_CONSTANTS.EMAIL.SECURE_SMTP_PORT,
      auth: {
        user,
        pass,
      },
    });

    return this.transporter;
  }
}

export const emailConfigurationManager = EmailConfigurationManager.getInstance();
