import nodemailer, { type Transporter } from "nodemailer";
import { APPLICATION_CONSTANTS } from "../utils/constants/applicationConstants";
import { APPLICATION_MESSAGES } from "../utils/messages/applicationMessages";

class EmailConfigurationManager {
  private static instance: EmailConfigurationManager;
  private transporter: Transporter | null = null;

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

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? APPLICATION_CONSTANTS.EMAIL_DEFAULT_SMTP_PORT);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || Number.isNaN(port) || !user || !pass) {
      const missingKeys = [
        !host ? "SMTP_HOST" : "",
        Number.isNaN(port) ? "SMTP_PORT" : "",
        !user ? "SMTP_USER" : "",
        !pass ? "SMTP_PASS" : "",
      ].filter(Boolean);

      throw new Error(
        `${APPLICATION_MESSAGES.EMAIL.SMTP_CONFIGURATION_MISSING}: ${missingKeys.join(", ")}`
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === APPLICATION_CONSTANTS.EMAIL_SECURE_SMTP_PORT,
      auth: {
        user,
        pass,
      },
    });

    return this.transporter;
  }
}

export const emailConfigurationManager = EmailConfigurationManager.getInstance();
