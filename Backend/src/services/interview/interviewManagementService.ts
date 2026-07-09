import mongoose, { ClientSession } from 'mongoose';
import { ApplicationModel } from '../../models/applicationModel';
import { InterviewModel, INTERVIEW_STATUSES, type IInterview } from '../../models/interviewModel';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { assertEntityExists } from '../../utils/common/entityHelpers';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import { APPLICATION_STATUS_VALUES } from '../application/helpers/applicationServiceHelpers';

const [interviewStatusScheduled, , interviewStatusCancelled] = INTERVIEW_STATUSES;

const fetchInterviewForCancellation = async (interviewId: string) => {
  return InterviewModel.findById(interviewId);
};

const fetchApplicationForInterviewCancellation = async (
  applicationId: IInterview['applicationId'],
) => {
  return ApplicationModel.findById(applicationId);
};

const updateCancelledInterview = async (interviewId: string) => {
  const interview = await fetchInterviewForCancellation(interviewId);
  assertEntityExists(interview, APPLICATION_MESSAGES.INTERVIEW.NOT_FOUND);

  if (interview.status !== interviewStatusScheduled) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.INTERVIEW.ONLY_SCHEDULED_CAN_BE_CANCELLED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  interview.status = interviewStatusCancelled;
  await interview.save();

  const applicationEntity = await fetchApplicationForInterviewCancellation(
    interview.applicationId,
  );
  assertEntityExists(applicationEntity, APPLICATION_MESSAGES.APPLICATION.NOT_FOUND);

  if (applicationEntity.status === APPLICATION_STATUS_VALUES.INTERVIEW_SCHEDULED) {
    applicationEntity.status = APPLICATION_STATUS_VALUES.SHORTLISTED;
    await applicationEntity.save();
  }

  return interview;
};

export const cancelInterviewByHr = async (interviewId: string) => {
  let cancelledInterview: IInterview | null = null;

  cancelledInterview = await updateCancelledInterview(interviewId);

  if (!cancelledInterview) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    );
  }
  return cancelledInterview;
};
