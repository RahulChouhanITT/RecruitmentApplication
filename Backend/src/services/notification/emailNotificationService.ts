import type { ApplicationStatus } from '../../utils/types/applicationTypes';
import {
  buildApplicationStatusEmail,
  buildApprovalPendingEmail,
  buildApprovalSuccessEmail,
  buildCandidateInterviewInviteEmail,
  buildInterviewerInterviewInviteEmail,
  buildJobAppliedSuccessEmail,
  buildOtpVerificationEmail,
} from './emailTemplateBuilder';
import { sendEmail, sendEmailPair } from './emailDeliveryService';

type ApplicationStatusEmailInput = {
  candidateEmail?: string;
  candidateName: string;
  jobTitle: string;
  applicationStatus: ApplicationStatus;
};

type JobAppliedEmailInput = {
  candidateEmail?: string;
  candidateName: string;
  jobTitle: string;
};

type InterviewInviteEmailInput = {
  candidateEmail?: string;
  candidateName: string;
  interviewerEmail?: string;
  interviewerName: string;
  jobTitle: string;
  interviewDate: string;
  interviewTime: string;
  meetingLink: string;
  startDateTimeIso: string;
  endDateTimeIso: string;
  notes: string;
};

export const sendOtpVerificationEmail = async (
  emailAddress: string,
  otpCode: string,
  userName: string,
): Promise<void> => {
  await sendEmail(emailAddress, buildOtpVerificationEmail(otpCode, userName));
};

export const sendApprovalPendingNotification = async (
  emailAddress: string,
  userName: string,
): Promise<void> => {
  try {
    await sendEmail(emailAddress, buildApprovalPendingEmail(userName));
  } catch (error) {
    console.error('Failed to send approval pending email', error);
    return;
  }
};

export const sendApprovalSuccessNotification = async (
  emailAddress: string,
  userName: string,
): Promise<void> => {
  try {
    await sendEmail(emailAddress, buildApprovalSuccessEmail(userName));
  } catch (error) {
    console.error('Failed to send approval success email', error);
    return;
  }
};

export const sendApplicationStatusUpdateEmail = async ({
  candidateEmail,
  candidateName,
  jobTitle,
  applicationStatus,
}: ApplicationStatusEmailInput): Promise<void> => {
  if (!candidateEmail || applicationStatus === 'APPLIED') {
    return;
  }

  try {
    await sendEmail(
      candidateEmail,
      buildApplicationStatusEmail(candidateName, jobTitle, applicationStatus),
    );
  } catch (error) {
    console.error('Failed to send application status email', error);
    return;
  }
};

export const sendJobApplicationConfirmationEmail = async ({
  candidateEmail,
  candidateName,
  jobTitle,
}: JobAppliedEmailInput): Promise<void> => {
  if (!candidateEmail) {
    return;
  }

  try {
    await sendEmail(candidateEmail, buildJobAppliedSuccessEmail(candidateName, jobTitle));
  } catch (error) {
    console.error('Failed to send job application email', error);
    return;
  }
};

export const sendInterviewInviteNotification = async ({
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
  if (!candidateEmail || !interviewerEmail) {
    return;
  }

  try {
    const inviteInput = {
      candidateName,
      interviewerName,
      jobTitle,
      interviewDate,
      interviewTime,
      meetingLink,
      startDateTimeIso,
      endDateTimeIso,
      notes,
    };

    await sendEmailPair(
      {
        toEmail: candidateEmail,
        message: buildCandidateInterviewInviteEmail(inviteInput),
      },
      {
        toEmail: interviewerEmail,
        message: buildInterviewerInterviewInviteEmail(inviteInput),
      },
    );
  } catch (error) {
    console.error('Failed to send interview invite emails', error);
    return;
  }
};
