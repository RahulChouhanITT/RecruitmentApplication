import { INTERVIEW_STATUSES } from '../../../models/interviewModel';
import { APPLICATION_CONSTANTS } from '../../../utils/constants/applicationConstants';
import { APPLICATION_STATUSES } from '../../../utils/types/applicationTypes';
import { normalizeUppercaseValue } from '../../../utils/common/stringHelpers';

export const resolveInterviewFeedbackStatus = (
  feedbackStatus: string | undefined,
  interviewStatus: string | undefined,
  applicationStatus?: string | undefined,
): 'PENDING' | 'NEEDS_REVIEW' | 'REVIEWED' => {
  const normalizedFeedbackStatus = normalizeUppercaseValue(feedbackStatus);
  if (
    normalizedFeedbackStatus === APPLICATION_CONSTANTS.FEEDBACK_STATUSES[0] ||
    normalizedFeedbackStatus === APPLICATION_CONSTANTS.FEEDBACK_STATUSES[1] ||
    normalizedFeedbackStatus === APPLICATION_CONSTANTS.FEEDBACK_STATUSES[2]
  ) {
    return normalizedFeedbackStatus;
  }

  const normalizedApplicationStatus = normalizeUppercaseValue(applicationStatus);
  if (
    normalizedApplicationStatus === APPLICATION_STATUSES[3] ||
    normalizedApplicationStatus === APPLICATION_STATUSES[4]
  ) {
    return APPLICATION_CONSTANTS.FEEDBACK_STATUSES[2];
  }

  const normalizedInterviewStatus = normalizeUppercaseValue(interviewStatus);
  if (normalizedInterviewStatus === INTERVIEW_STATUSES[1]) {
    return APPLICATION_CONSTANTS.FEEDBACK_STATUSES[1];
  }

  return APPLICATION_CONSTANTS.FEEDBACK_STATUSES[0];
};
