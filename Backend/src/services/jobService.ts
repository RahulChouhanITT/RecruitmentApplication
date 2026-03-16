import { Types } from "mongoose";
import { JobModel } from "../models/jobModel";
import { ApplicationModel } from "../models/applicationModel";
import { CandidateProfileModel } from "../models/candidateProfileModel";
import { UserModel } from "../models/userModel";
import { ApplicationError, APPLICATION_CONSTANTS, APPLICATION_MESSAGES } from "../utils";
import {
  assertEntityExists,
  trimValue,
} from "../utils/helpers";
import { sendJobAppliedSuccessEmail } from "../utils/helpers/emailHelper";
import {
  JOB_EXPERIENCE_LEVELS,
  APPLICATION_STATUSES,
  type CreateJobRequestBody,
  type JobListQuery,
  type UpdateJobRequestBody,
  type PopulatedCandidate,
  type PaginationResult,
} from "../utils/types";

type ApplicationWithCandidateLean = {
  _id: Types.ObjectId;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  candidateId: Types.ObjectId | PopulatedCandidate;
};

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
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  if (!JOB_EXPERIENCE_LEVELS.includes(experienceLevel as (typeof JOB_EXPERIENCE_LEVELS)[number])) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.JOB.INVALID_EXPERIENCE_LEVEL,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST
    );
  }
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

export const updateJob = async (jobId: string, payload: UpdateJobRequestBody, _hrUserId: string) => {
  const job = await JobModel.findById(jobId);
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
    if (!JOB_EXPERIENCE_LEVELS.includes(experienceLevel as (typeof JOB_EXPERIENCE_LEVELS)[number])) {
      throw new ApplicationError(
        APPLICATION_MESSAGES.JOB.INVALID_EXPERIENCE_LEVEL,
        APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST
      );
    }
    job.experienceLevel = experienceLevel;
  }

  await job.save();
  return job;
};

export const closeJob = async (jobId: string, _hrUserId: string) => {
  const job = await JobModel.findById(jobId);
  assertEntityExists(job, APPLICATION_MESSAGES.JOB.NOT_FOUND);

  job.isActive = false;
  await job.save();
  return job;
};

export const activateJob = async (jobId: string, _hrUserId: string) => {
  const job = await JobModel.findById(jobId);
  assertEntityExists(job, APPLICATION_MESSAGES.JOB.NOT_FOUND);

  job.isActive = true;
  await job.save();
  return job;
};

const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
};

const buildSearchFilter = (query: JobListQuery) => {
  const filter: Record<string, unknown> = {};

  if (trimValue(query.requiredSkills)) {
    filter.requiredSkills = { $regex: trimValue(query.requiredSkills), $options: "i" };
  }

  if (trimValue(query.experienceLevel)) {
    filter.experienceLevel = { $regex: trimValue(query.experienceLevel), $options: "i" };
  }

  if (trimValue(query.search)) {
    const pattern = { $regex: trimValue(query.search), $options: "i" };
    filter.$or = [{ title: pattern }, { description: pattern }, { requiredSkills: pattern }];
  }

  return filter;
};

const getPaginatedJobs = async (
  baseFilter: Record<string, unknown>,
  query: JobListQuery
): Promise<PaginationResult<unknown>> => {
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 10);
  const skip = (page - 1) * limit;

  const filter = { ...baseFilter, ...buildSearchFilter(query) };
  const total = await JobModel.countDocuments(filter);
  const data = await JobModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 1,
    },
  };
};

export const getAllActiveJobsForCandidate = async (query: JobListQuery) => {
  return getPaginatedJobs({ isActive: true }, query);
};

export const getJobsForHr = async (_hrUserId: string, query: JobListQuery) => {
  const baseFilter: Record<string, unknown> = {};

  if (query.isActive !== undefined) {
    if (query.isActive === "true") {
      baseFilter.isActive = true;
    } else if (query.isActive === "false") {
      baseFilter.isActive = false;
    }
  }

  const result = await getPaginatedJobs(baseFilter, query);
  const jobIds = result.data.map((job) => (job as { _id: Types.ObjectId })._id).filter(Boolean);

  if (jobIds.length === 0) {
    return result;
  }

  const aggregatedCounts = await ApplicationModel.aggregate<{ _id: Types.ObjectId; total: number }>([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: "$jobId", total: { $sum: 1 } } },
  ]);

  const countsByJobId = new Map<string, number>(
    aggregatedCounts.map((count) => [count._id.toString(), count.total])
  );

  const dataWithCounts = result.data.map((job) => {
    const normalizedJob =
      typeof (job as { toObject?: () => unknown }).toObject === "function"
        ? (job as { toObject: () => Record<string, unknown> }).toObject()
        : (job as Record<string, unknown>);

    const jobId = (normalizedJob._id as Types.ObjectId).toString();
    return {
      ...normalizedJob,
      applicationCount: countsByJobId.get(jobId) ?? 0,
    };
  });

  return {
    ...result,
    data: dataWithCounts,
  };
};

export const applyForJob = async (jobId: string, candidateUserId: string) => {
  const job = await JobModel.findById(jobId);
  if (!job || !job.isActive) {
    throw new ApplicationError(APPLICATION_MESSAGES.APPLICATION.JOB_NOT_AVAILABLE_FOR_APPLICATION, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  const existingApplication = await ApplicationModel.findOne({
    jobId,
    candidateId: candidateUserId,
  });
  if (existingApplication) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.JOB.ALREADY_APPLIED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CONFLICT
    );
  }

  const application = await ApplicationModel.create({
    jobId,
    candidateId: new Types.ObjectId(candidateUserId),
    status: APPLICATION_STATUSES[0],
  });

  try {
    const candidate = await UserModel.findById(candidateUserId).select("name email");
    if (candidate?.email) {
      await sendJobAppliedSuccessEmail(candidate.email, candidate.name, job.title);
    }
  } catch (_error) {
  }

  return application;
};

export const getAppliedJobsForCandidate = async (candidateUserId: string) => {
  return ApplicationModel.find({ candidateId: candidateUserId })
    .populate("jobId")
    .sort({ createdAt: -1 });
};

export const getApplicationsForHrJob = async (jobId: string, _hrUserId: string) => {
  const job = await JobModel.findById(jobId);
  assertEntityExists(job, APPLICATION_MESSAGES.JOB.NOT_FOUND);

  const applications = await ApplicationModel.find({ jobId })
    .populate("candidateId", "name email")
    .sort({ createdAt: -1 })
    .lean<ApplicationWithCandidateLean[]>();

  const candidateUserIds = applications
    .map((application) => {
      const candidate =
        typeof application.candidateId === "object" &&
        application.candidateId !== null &&
        "_id" in application.candidateId
          ? (application.candidateId as PopulatedCandidate)
          : null;
      return candidate?._id;
    })
    .filter(Boolean) as Types.ObjectId[];

  const candidateProfiles = await CandidateProfileModel.find({ userId: { $in: candidateUserIds } }).lean();
  const profileMap = new Map(
    candidateProfiles.map((profile) => [profile.userId.toString(), profile])
  );

  return applications
    .map((application) => {
      const candidate =
        typeof application.candidateId === "object" &&
        application.candidateId !== null &&
        "_id" in application.candidateId
          ? (application.candidateId as PopulatedCandidate)
          : null;

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
