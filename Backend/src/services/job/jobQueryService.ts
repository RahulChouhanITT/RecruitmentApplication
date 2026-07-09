import { Types } from 'mongoose';
import { ApplicationModel } from '../../models/applicationModel';
import { JobModel } from '../../models/jobModel';
import { trimValue } from '../../utils/common/stringHelpers';
import type { JobListQuery, PaginationResult } from '../../utils/types';

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

const buildJobSearchFilter = (query: JobListQuery) => {
  const filter: Record<string, unknown> = {};

  if (trimValue(query.requiredSkills)) {
    filter.requiredSkills = { $regex: trimValue(query.requiredSkills), $options: 'i' };
  }

  if (trimValue(query.experienceLevel)) {
    filter.experienceLevel = { $regex: trimValue(query.experienceLevel), $options: 'i' };
  }

  if (trimValue(query.search)) {
    const pattern = { $regex: trimValue(query.search), $options: 'i' };
    filter.$or = [{ title: pattern }, { description: pattern }, { requiredSkills: pattern }];
  }

  return filter;
};

const findPaginatedJobs = async (
  baseFilter: Record<string, unknown>,
  query: JobListQuery,
): Promise<PaginationResult<unknown>> => {
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 10);
  const skip = (page - 1) * limit;

  const filter = { ...baseFilter, ...buildJobSearchFilter(query) };
  const total = await JobModel.countDocuments(filter);
  const data = await JobModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

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

const findApplicationCountsByJobIds = async (jobIds: Types.ObjectId[]) => {
  return ApplicationModel.aggregate<{ _id: Types.ObjectId; total: number }>([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: '$jobId', total: { $sum: 1 } } },
  ]);
};

export const getAllActiveJobsForCandidate = async (query: JobListQuery) => {
  return findPaginatedJobs({ isActive: true }, query);
};

export const getJobsForHr = async (_hrUserId: string, query: JobListQuery) => {
  const baseFilter: Record<string, unknown> = {};

  if (query.isActive !== undefined) {
    if (query.isActive === 'true') {
      baseFilter.isActive = true;
    } else if (query.isActive === 'false') {
      baseFilter.isActive = false;
    }
  }

  const result = await findPaginatedJobs(baseFilter, query);
  const jobIds = result.data.map((job) => (job as { _id: Types.ObjectId })._id).filter(Boolean);

  if (jobIds.length === 0) {
    return result;
  }

  const aggregatedCounts = await findApplicationCountsByJobIds(jobIds);
  const countsByJobId = new Map<string, number>(
    aggregatedCounts.map((count) => [count._id.toString(), count.total]),
  );

  const dataWithCounts = result.data.map((job) => {
    const normalizedJob =
      typeof (job as { toObject?: () => unknown }).toObject === 'function'
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
