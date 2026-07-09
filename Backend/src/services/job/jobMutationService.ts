import { Types } from 'mongoose';
import { JobModel } from '../../models/jobModel';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { assertEntityExists } from '../../utils/common/entityHelpers';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import { trimValue } from '../../utils/common/stringHelpers';
import {
  JOB_EXPERIENCE_LEVELS,
  type CreateJobRequestBody,
  type UpdateJobRequestBody,
} from '../../utils/types';

const validateCreateJobInput = (payload: CreateJobRequestBody): void => {
  const experienceLevel = trimValue(payload.experienceLevel);

  if (
    !trimValue(payload.title) ||
    !trimValue(payload.description) ||
    !trimValue(payload.requiredSkills) ||
    !experienceLevel
  ) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  if (!JOB_EXPERIENCE_LEVELS.includes(experienceLevel as (typeof JOB_EXPERIENCE_LEVELS)[number])) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.JOB.INVALID_EXPERIENCE_LEVEL,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }
};

const findJobByIdForUpdate = async (jobId: string) => {
  return JobModel.findById(jobId);
};

export const createJob = async (payload: CreateJobRequestBody, hrUserId: string) => {
  validateCreateJobInput(payload);

  return JobModel.create({
    title: trimValue(payload.title),
    description: trimValue(payload.description),
    requiredSkills: trimValue(payload.requiredSkills),
    experienceLevel: trimValue(payload.experienceLevel),
    createdBy: new Types.ObjectId(hrUserId),
  });
};

export const updateJob = async (
  jobId: string,
  payload: UpdateJobRequestBody,
  _hrUserId: string,
) => {
  const job = await findJobByIdForUpdate(jobId);
  assertEntityExists(job, APPLICATION_MESSAGES.JOB.NOT_FOUND);

  if (payload.title !== undefined) {
    job.title = trimValue(payload.title);
  }
  if (payload.description !== undefined) {
    job.description = trimValue(payload.description);
  }
  if (payload.requiredSkills !== undefined) {
    job.requiredSkills = trimValue(payload.requiredSkills);
  }
  if (payload.experienceLevel !== undefined) {
    const experienceLevel = trimValue(payload.experienceLevel);
    if (
      !JOB_EXPERIENCE_LEVELS.includes(experienceLevel as (typeof JOB_EXPERIENCE_LEVELS)[number])
    ) {
      throw new ApplicationError(
        APPLICATION_MESSAGES.JOB.INVALID_EXPERIENCE_LEVEL,
        APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
      );
    }
    job.experienceLevel = experienceLevel;
  }

  await job.save();
  return job;
};

export const closeJob = async (jobId: string, _hrUserId: string) => {
  const job = await findJobByIdForUpdate(jobId);
  assertEntityExists(job, APPLICATION_MESSAGES.JOB.NOT_FOUND);

  job.isActive = false;
  await job.save();
  return job;
};

export const activateJob = async (jobId: string, _hrUserId: string) => {
  const job = await findJobByIdForUpdate(jobId);
  assertEntityExists(job, APPLICATION_MESSAGES.JOB.NOT_FOUND);

  job.isActive = true;
  await job.save();
  return job;
};
