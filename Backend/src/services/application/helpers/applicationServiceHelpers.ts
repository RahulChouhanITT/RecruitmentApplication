import { APPLICATION_CONSTANTS } from '../../../utils/constants/applicationConstants';
import { ApplicationError } from '../../../utils/errors/applicationError';
import { APPLICATION_MESSAGES } from '../../../utils/messages/applicationMessages';
import { normalizeStatusValue } from '../../../utils/common/stringHelpers';
import type {
  ApplicationStatus,
  CandidateProfileSummary,
  HrJobApplicationWithCandidateLean,
} from '../../../utils/types/applicationTypes';
import type { PopulatedCandidate } from '../../../utils/types/candidateTypes';
import { APPLICATION_STATUSES as applicationStatuses } from '../../../utils/types/applicationTypes';
import type { NotificationPayload } from '../../../utils/types/serviceTypes';

const [
  applicationStatusApplied,
  applicationStatusShortlisted,
  applicationStatusInterviewScheduled,
  applicationStatusHired,
  applicationStatusRejected,
] = applicationStatuses;

export const APPLICATION_STATUS_VALUES = {
  APPLIED: applicationStatusApplied,
  SHORTLISTED: applicationStatusShortlisted,
  INTERVIEW_SCHEDULED: applicationStatusInterviewScheduled,
  HIRED: applicationStatusHired,
  REJECTED: applicationStatusRejected,
} as const;

type EmailNotifiedApplicationStatus =
  | typeof APPLICATION_STATUS_VALUES.SHORTLISTED
  | typeof APPLICATION_STATUS_VALUES.INTERVIEW_SCHEDULED
  | typeof APPLICATION_STATUS_VALUES.HIRED
  | typeof APPLICATION_STATUS_VALUES.REJECTED;

export const normalizeApplicationStatus = (status: string): ApplicationStatus => {
  const normalizedStatus = normalizeStatusValue(status);

  if (!(applicationStatuses as readonly string[]).includes(normalizedStatus)) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.APPLICATION.INVALID_STATUS,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  return normalizedStatus as ApplicationStatus;
};

export const shouldSendApplicationStatusEmail = (
  status: ApplicationStatus,
): status is EmailNotifiedApplicationStatus => {
  return (
    status === APPLICATION_STATUS_VALUES.SHORTLISTED ||
    status === APPLICATION_STATUS_VALUES.REJECTED ||
    status === APPLICATION_STATUS_VALUES.HIRED ||
    status === APPLICATION_STATUS_VALUES.INTERVIEW_SCHEDULED
  );
};

export const assertApplicationStatusChangeAllowed = (
  currentStatus: string,
  nextStatus: ApplicationStatus,
): void => {
  if (
    currentStatus === APPLICATION_STATUS_VALUES.HIRED &&
    nextStatus !== APPLICATION_STATUS_VALUES.HIRED
  ) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.APPLICATION.HIRED_STATUS_LOCKED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  if (
    currentStatus === APPLICATION_STATUS_VALUES.REJECTED &&
    nextStatus !== APPLICATION_STATUS_VALUES.REJECTED
  ) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.APPLICATION.REJECTED_STATUS_LOCKED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }
};

export const extractPopulatedCandidate = (
  application: HrJobApplicationWithCandidateLean,
): PopulatedCandidate | null => {
  if (
    typeof application.candidateId === 'object' &&
    application.candidateId !== null &&
    '_id' in application.candidateId
  ) {
    return application.candidateId as PopulatedCandidate;
  }

  return null;
};

export const buildCandidateProfileMap = (candidateProfiles: CandidateProfileSummary[]) => {
  return new Map(candidateProfiles.map((profile) => [profile.userId.toString(), profile]));
};

export const mapHrApplicationsWithProfiles = (
  applications: HrJobApplicationWithCandidateLean[],
  profileMap: Map<string, CandidateProfileSummary>,
) => {
  return applications
    .map((application) => {
      const candidate = extractPopulatedCandidate(application);

      if (!candidate?._id) {
        return null;
      }

      const profile = profileMap.get(candidate._id.toString());

      return {
        _id: application._id,
        status: application.status,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        candidate: {
          _id: candidate._id,
          name: candidate.name ?? APPLICATION_CONSTANTS.EMPTY_STRING,
          email: candidate.email ?? APPLICATION_CONSTANTS.EMPTY_STRING,
        },
        profile: {
          skills: profile?.skills ?? APPLICATION_CONSTANTS.EMPTY_STRING,
          experienceYears: profile?.experienceYears ?? 0,
          resumeUrl: profile?.resumeUrl ?? APPLICATION_CONSTANTS.EMPTY_STRING,
          currentLocation: profile?.currentLocation ?? APPLICATION_CONSTANTS.EMPTY_STRING,
        },
      };
    })
    .filter((application): application is NonNullable<typeof application> => Boolean(application));
};

export type ApplicationStatusEmailNotification = {
  candidateEmail?: string;
  candidateName: string;
  jobTitle: string;
  applicationStatus: ApplicationStatus;
};

export const buildApplicationStatusNotificationPayload = (
  emailNotification: ApplicationStatusEmailNotification | null,
): NotificationPayload | null => {
  if (
    !emailNotification ||
    !shouldSendApplicationStatusEmail(emailNotification.applicationStatus)
  ) {
    return null;
  }

  return {
    kind: 'applicationStatusUpdated',
    candidateEmail: emailNotification.candidateEmail,
    candidateName: emailNotification.candidateName,
    jobTitle: emailNotification.jobTitle,
    applicationStatus: emailNotification.applicationStatus,
  };
};

export const buildJobApplicationFilter = (jobId: string, candidateUserId: string) => ({
  jobId,
  candidateId: candidateUserId,
});

export const buildJobApplicationConfirmationNotificationPayload = (
  candidate: { email?: string; name?: string } | null,
  jobTitle: string,
): NotificationPayload => ({
  kind: 'jobApplicationConfirmed',
  candidateEmail: candidate?.email,
  candidateName: candidate?.name ?? APPLICATION_CONSTANTS.EMPTY_STRING,
  jobTitle,
});
