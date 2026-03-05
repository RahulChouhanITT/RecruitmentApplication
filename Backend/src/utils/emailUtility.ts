import { emailConfigurationManager } from "../configuration/emailConfiguration";
import { APPLICATION_CONSTANTS } from "./constants/applicationConstants";
import { APPLICATION_MESSAGES } from "./messages/applicationMessages";

const getFromAddress = (): string => {
  const fromName = process.env.SMTP_FROM_NAME || APPLICATION_CONSTANTS.EMAIL_DEFAULT_FROM_NAME;
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  if (!fromEmail) {
    throw new Error(APPLICATION_MESSAGES.EMAIL.FROM_EMAIL_REQUIRED);
  }

  return `${fromName} <${fromEmail}>`;
};

export const sendOtpEmail = async (toEmail: string, otpCode: string, userName: string): Promise<void> => {
  const transporter = emailConfigurationManager.getTransporter();

  await transporter.sendMail({
    from: getFromAddress(),
    to: toEmail,
    subject: "Email Verification OTP",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Email Verification</h2>
        <p>Hello ${userName},</p>
        <p>Your OTP for email verification is:</p>
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 10px 0;">${otpCode}</p>
        <p>This OTP will expire in 10 minutes.</p>
      </div>
    `,
  });
};

export const sendApprovalPendingEmail = async (toEmail: string, userName: string): Promise<void> => {
  const transporter = emailConfigurationManager.getTransporter();

  await transporter.sendMail({
    from: getFromAddress(),
    to: toEmail,
    subject: "Approval Request Pending",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Approval Pending</h2>
        <p>Hi ${userName},</p>
        <p>Your approval request is pending.</p>
        <p>Once your request is approved, we will inform you via email.</p>
      </div>
    `,
  });
};
