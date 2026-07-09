import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';

type EmailMessage = {
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
};

const toUtcIcsDateTime = (isoDate: string): string => {
  return isoDate.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
};

export const buildOtpVerificationEmail = (otpCode: string, userName: string): EmailMessage => ({
  subject: 'Email Verification OTP',
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

export const buildApprovalPendingEmail = (userName: string): EmailMessage => ({
  subject: 'Approval Request Pending',
  html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Approval Pending</h2>
        <p>Hi ${userName},</p>
        <p>Your approval request is pending.</p>
        <p>Once your request is approved, we will inform you via email.</p>
      </div>
    `,
});

export const buildApprovalSuccessEmail = (userName: string): EmailMessage => ({
  subject: 'Account Approved Successfully',
  html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Account Approved</h2>
        <p>Hi ${userName},</p>
        <p>Your account has been approved successfully.</p>
        <p>You can now login and start using the portal.</p>
      </div>
    `,
});

export const buildJobAppliedSuccessEmail = (userName: string, jobTitle: string): EmailMessage => ({
  subject: 'Job Application Submitted Successfully',
  html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Application Submitted</h2>
        <p>Hi ${userName},</p>
        <p>Your application for <strong>${jobTitle}</strong> has been submitted successfully.</p>
        <p>We will notify you about the next status updates.</p>
      </div>
    `,
});

export const buildInterviewScheduledEmail = (
  userName: string,
  jobTitle: string,
  interviewDate: string,
  interviewTime: string,
  meetingLink: string,
): EmailMessage => ({
  subject: 'Interview Scheduled',
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

type InterviewInviteEmailInput = {
  candidateName: string;
  interviewerName: string;
  jobTitle: string;
  interviewDate: string;
  interviewTime: string;
  meetingLink: string;
  startDateTimeIso: string;
  endDateTimeIso: string;
  notes?: string;
};

const buildInterviewInviteAttachments = ({
  jobTitle,
  meetingLink,
  notes,
  startDateTimeIso,
  endDateTimeIso,
}: Pick<
  InterviewInviteEmailInput,
  'jobTitle' | 'meetingLink' | 'notes' | 'startDateTimeIso' | 'endDateTimeIso'
>) => {
  const iCalText = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RecruitmentApplication//Interview Invite//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${APPLICATION_CONSTANTS.GOOGLE_OAUTH.REQUEST_ID_PREFIX}${Date.now()}@${APPLICATION_CONSTANTS.EMAIL.ICS_DOMAIN}`,
    `DTSTAMP:${toUtcIcsDateTime(new Date().toISOString())}`,
    `DTSTART:${toUtcIcsDateTime(startDateTimeIso)}`,
    `DTEND:${toUtcIcsDateTime(endDateTimeIso)}`,
    `SUMMARY:Interview - ${jobTitle}`,
    `DESCRIPTION:${(notes || APPLICATION_CONSTANTS.INTERVIEW.DEFAULT_DESCRIPTION).replace(/\n/g, '\\n')}\\nMeet Link: ${meetingLink}`,
    'STATUS:CONFIRMED',
    `LOCATION:${meetingLink}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return [
    {
      filename: APPLICATION_CONSTANTS.EMAIL.ICS_FILENAME,
      content: iCalText,
      contentType: 'text/calendar; charset=utf-8; method=REQUEST',
    },
  ];
};

export const buildCandidateInterviewInviteEmail = (
  input: InterviewInviteEmailInput,
): EmailMessage => ({
  subject: 'Interview Scheduled',
  html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Interview Invitation</h2>
        <p>Hello ${input.candidateName},</p>
        <p>Your interview for the position <strong>${input.jobTitle}</strong> has been scheduled.</p>
        <p><strong>Date:</strong> ${input.interviewDate}</p>
        <p><strong>Time:</strong> ${input.interviewTime}</p>
        <p><strong>Interviewer:</strong> ${input.interviewerName}</p>
        <p><strong>Join meeting:</strong> <a href="${input.meetingLink}" target="_blank" rel="noopener noreferrer">${input.meetingLink}</a></p>
      </div>
    `,
  attachments: buildInterviewInviteAttachments(input),
});

export const buildInterviewerInterviewInviteEmail = (
  input: InterviewInviteEmailInput,
): EmailMessage => ({
  subject: 'Interview Assigned',
  html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Interview Assignment</h2>
        <p>Hello ${input.interviewerName},</p>
        <p>You have been assigned to interview candidate <strong>${input.candidateName}</strong> for <strong>${input.jobTitle}</strong>.</p>
        <p><strong>Date:</strong> ${input.interviewDate}</p>
        <p><strong>Time:</strong> ${input.interviewTime}</p>
        <p><strong>Join meeting:</strong> <a href="${input.meetingLink}" target="_blank" rel="noopener noreferrer">${input.meetingLink}</a></p>
      </div>
    `,
  attachments: buildInterviewInviteAttachments(input),
});

export const buildApplicationStatusEmail = (
  userName: string,
  jobTitle: string,
  status: 'SHORTLISTED' | 'REJECTED' | 'HIRED' | 'INTERVIEW_SCHEDULED',
): EmailMessage => {
  const contentByStatus: Record<
    'SHORTLISTED' | 'REJECTED' | 'HIRED' | 'INTERVIEW_SCHEDULED',
    { subject: string; body: string }
  > = {
    SHORTLISTED: {
      subject: 'Application Shortlisted',
      body: `Congratulations! Your application for the position "${jobTitle}" has been shortlisted.`,
    },
    REJECTED: {
      subject: 'Application Update',
      body: 'Thank you for applying. Unfortunately, your application was not selected for the next stage.',
    },
    INTERVIEW_SCHEDULED: {
      subject: 'Interview Invitation',
      body: 'Your interview has been scheduled. Please check the meeting details sent to you.',
    },
    HIRED: {
      subject: 'Application Update',
      body: `Congratulations! You have been marked as hired for "${jobTitle}".`,
    },
  };

  const selectedContent = contentByStatus[status];

  return {
    subject: selectedContent.subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">${selectedContent.subject}</h2>
        <p>Hello ${userName},</p>
        <p>${selectedContent.body}</p>
      </div>
    `,
  };
};
