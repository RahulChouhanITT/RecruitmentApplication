import { emailConfigurationManager } from '../../configuration/emailConfiguration';
import { env } from '../../configuration/env';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';

type EmailMessage = {
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
};

const getFromAddress = (): string => {
  const fromName = env.SMTP_FROM_NAME || APPLICATION_CONSTANTS.EMAIL.DEFAULT_FROM_NAME;
  const fromEmail = env.SMTP_FROM_EMAIL || env.SMTP_USER;

  if (!fromEmail) {
    throw new Error(APPLICATION_MESSAGES.EMAIL.FROM_EMAIL_REQUIRED);
  }

  return `${fromName} <${fromEmail}>`;
};

export const sendEmail = async (toEmail: string, message: EmailMessage): Promise<void> => {
  const transporter = emailConfigurationManager.getTransporter();

  await transporter.sendMail({
    from: getFromAddress(),
    to: toEmail,
    subject: message.subject,
    html: message.html,
    attachments: message.attachments,
  });
};

export const sendEmailPair = async (
  firstEmail: { toEmail: string; message: EmailMessage },
  secondEmail: { toEmail: string; message: EmailMessage },
): Promise<void> => {
  await sendEmail(firstEmail.toEmail, firstEmail.message);
  await sendEmail(secondEmail.toEmail, secondEmail.message);
};
