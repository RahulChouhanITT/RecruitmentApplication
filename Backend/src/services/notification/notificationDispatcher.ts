import type { NotificationPayload } from '../../utils/types';
import {
  sendApplicationStatusUpdateEmail,
  sendApprovalPendingNotification,
  sendApprovalSuccessNotification,
  sendInterviewInviteNotification,
  sendJobApplicationConfirmationEmail,
  sendOtpVerificationEmail,
} from './emailNotificationService';

const dispatchNotification = async (notificationPayload: NotificationPayload): Promise<void> => {
  switch (notificationPayload.kind) {
    case 'otpVerification':
      await sendOtpVerificationEmail(
        notificationPayload.emailAddress,
        notificationPayload.otpCode,
        notificationPayload.userName,
      );
      return;
    case 'approvalPending':
      await sendApprovalPendingNotification(
        notificationPayload.emailAddress,
        notificationPayload.userName,
      );
      return;
    case 'approvalSuccess':
      await sendApprovalSuccessNotification(
        notificationPayload.emailAddress,
        notificationPayload.userName,
      );
      return;
    case 'applicationStatusUpdated':
      await sendApplicationStatusUpdateEmail(notificationPayload);
      return;
    case 'jobApplicationConfirmed':
      await sendJobApplicationConfirmationEmail(notificationPayload);
      return;
    case 'interviewInvite':
      await sendInterviewInviteNotification(notificationPayload);
      return;
    default:
      return;
  }
};

export const sendNotification = async (
  notificationPayload?: NotificationPayload | NotificationPayload[] | null,
): Promise<void> => {
  if (!notificationPayload) {
    return;
  }

  const notifications = Array.isArray(notificationPayload)
    ? notificationPayload
    : [notificationPayload];
  await Promise.all(notifications.map(dispatchNotification));
};
