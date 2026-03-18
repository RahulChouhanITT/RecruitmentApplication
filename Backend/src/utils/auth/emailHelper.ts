import { emailConfigurationManager } from "../../configuration/emailConfiguration";
import { APPLICATION_CONSTANTS } from "../constants/applicationConstants";
import { APPLICATION_MESSAGES } from "../messages/applicationMessages";

const getFromAddress = (): string => {
  const fromName = process.env.SMTP_FROM_NAME || APPLICATION_CONSTANTS.EMAIL.DEFAULT_FROM_NAME;
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  if (!fromEmail) {
    throw new Error(APPLICATION_MESSAGES.EMAIL.FROM_EMAIL_REQUIRED);
  }

  return `${fromName} <${fromEmail}>`;
};

const toUtcIcsDateTime = (isoDate: string): string => {
  return isoDate.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
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

export const sendApprovalSuccessEmail = async (toEmail: string, userName: string): Promise<void> => {
  const transporter = emailConfigurationManager.getTransporter();

  await transporter.sendMail({
    from: getFromAddress(),
    to: toEmail,
    subject: "Account Approved Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Account Approved</h2>
        <p>Hi ${userName},</p>
        <p>Your account has been approved successfully.</p>
        <p>You can now login and start using the portal.</p>
      </div>
    `,
  });
};

export const sendJobAppliedSuccessEmail = async (
  toEmail: string,
  userName: string,
  jobTitle: string
): Promise<void> => {
  const transporter = emailConfigurationManager.getTransporter();

  await transporter.sendMail({
    from: getFromAddress(),
    to: toEmail,
    subject: "Job Application Submitted Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Application Submitted</h2>
        <p>Hi ${userName},</p>
        <p>Your application for <strong>${jobTitle}</strong> has been submitted successfully.</p>
        <p>We will notify you about the next status updates.</p>
      </div>
    `,
  });
};

export const sendInterviewScheduledEmail = async (
  toEmail: string,
  userName: string,
  jobTitle: string,
  interviewDate: string,
  interviewTime: string,
  meetingLink: string
): Promise<void> => {
  const transporter = emailConfigurationManager.getTransporter();

  await transporter.sendMail({
    from: getFromAddress(),
    to: toEmail,
    subject: "Interview Scheduled",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Interview Scheduled</h2>
        <p>Hello ${userName},</p>
        <p>Your interview for the position <strong>${jobTitle}</strong> has been scheduled.</p>
        <p><strong>Date:</strong> ${interviewDate}</p>
        <p><strong>Time:</strong> ${interviewTime}</p>
        <p><strong>Join meeting:</strong> <a href="${meetingLink}" target="_blank" rel="noopener noreferrer">${meetingLink}</a></p>
      </div>
    `,
  });
};

type InterviewInviteEmailInput = {
  candidateEmail: string;
  candidateName: string;
  interviewerEmail: string;
  interviewerName: string;
  jobTitle: string;
  interviewDate: string;
  interviewTime: string;
  meetingLink: string;
  startDateTimeIso: string;
  endDateTimeIso: string;
  notes?: string;
};

export const sendInterviewInviteEmails = async ({
  candidateEmail,
  candidateName,
  interviewerEmail,
  interviewerName,
  jobTitle,
  interviewDate,
  interviewTime,
  meetingLink,
  startDateTimeIso,
  endDateTimeIso,
  notes,
}: InterviewInviteEmailInput): Promise<void> => {
  const transporter = emailConfigurationManager.getTransporter();
  const fromAddress = getFromAddress();
  const iCalText = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RecruitmentApplication//Interview Invite//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${APPLICATION_CONSTANTS.GOOGLE_OAUTH.REQUEST_ID_PREFIX}${Date.now()}@${APPLICATION_CONSTANTS.EMAIL.ICS_DOMAIN}`,
    `DTSTAMP:${toUtcIcsDateTime(new Date().toISOString())}`,
    `DTSTART:${toUtcIcsDateTime(startDateTimeIso)}`,
    `DTEND:${toUtcIcsDateTime(endDateTimeIso)}`,
    `SUMMARY:Interview - ${jobTitle}`,
    `DESCRIPTION:${(notes || APPLICATION_CONSTANTS.INTERVIEW.DEFAULT_DESCRIPTION).replace(/\n/g, "\\n")}\\nMeet Link: ${meetingLink}`,
    "STATUS:CONFIRMED",
    `LOCATION:${meetingLink}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const attachments = [
    {
      filename: APPLICATION_CONSTANTS.EMAIL.ICS_FILENAME,
      content: iCalText,
      contentType: "text/calendar; charset=utf-8; method=REQUEST",
    },
  ];

  await transporter.sendMail({
    from: fromAddress,
    to: candidateEmail,
    subject: "Interview Scheduled",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Interview Invitation</h2>
        <p>Hello ${candidateName},</p>
        <p>Your interview for the position <strong>${jobTitle}</strong> has been scheduled.</p>
        <p><strong>Date:</strong> ${interviewDate}</p>
        <p><strong>Time:</strong> ${interviewTime}</p>
        <p><strong>Interviewer:</strong> ${interviewerName}</p>
        <p><strong>Join meeting:</strong> <a href="${meetingLink}" target="_blank" rel="noopener noreferrer">${meetingLink}</a></p>
      </div>
    `,
    attachments,
  });

  await transporter.sendMail({
    from: fromAddress,
    to: interviewerEmail,
    subject: "Interview Assigned",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Interview Assignment</h2>
        <p>Hello ${interviewerName},</p>
        <p>You have been assigned to interview candidate <strong>${candidateName}</strong> for <strong>${jobTitle}</strong>.</p>
        <p><strong>Date:</strong> ${interviewDate}</p>
        <p><strong>Time:</strong> ${interviewTime}</p>
        <p><strong>Join meeting:</strong> <a href="${meetingLink}" target="_blank" rel="noopener noreferrer">${meetingLink}</a></p>
      </div>
    `,
    attachments,
  });
};

export const sendApplicationStatusEmail = async (
  toEmail: string,
  userName: string,
  jobTitle: string,
  status: "SHORTLISTED" | "REJECTED" | "HIRED" | "INTERVIEW_SCHEDULED"
): Promise<void> => {
  const transporter = emailConfigurationManager.getTransporter();

  const contentByStatus: Record<
    "SHORTLISTED" | "REJECTED" | "HIRED" | "INTERVIEW_SCHEDULED",
    { subject: string; body: string }
  > = {
    SHORTLISTED: {
      subject: "Application Shortlisted",
      body: `Congratulations! Your application for the position "${jobTitle}" has been shortlisted.`,
    },
    REJECTED: {
      subject: "Application Update",
      body: "Thank you for applying. Unfortunately, your application was not selected for the next stage.",
    },
    INTERVIEW_SCHEDULED: {
      subject: "Interview Invitation",
      body: "Your interview has been scheduled. Please check the meeting details sent to you.",
    },
    HIRED: {
      subject: "Application Update",
      body: `Congratulations! You have been marked as hired for "${jobTitle}".`,
    },
  };

  const selectedContent = contentByStatus[status];

  await transporter.sendMail({
    from: getFromAddress(),
    to: toEmail,
    subject: selectedContent.subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">${selectedContent.subject}</h2>
        <p>Hello ${userName},</p>
        <p>${selectedContent.body}</p>
      </div>
    `,
  });
};
