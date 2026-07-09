import { Types } from 'mongoose';
import { ApplicationModel } from '../../models/applicationModel';
import { CandidateProfileModel } from '../../models/candidateProfileModel';
import { JobModel } from '../../models/jobModel';
import { assertEntityExists } from '../../utils/common/entityHelpers';
import {
  buildCandidateProfileMap,
  extractPopulatedCandidate,
  mapHrApplicationsWithProfiles,
} from './helpers/applicationServiceHelpers';
import { trimValue } from '../../utils/common/stringHelpers';
import { POPULATED_ENTITY_EXCLUDED_FIELDS } from '../../utils/constants';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import type {
  ApplicationListQuery,
  CandidateProfileSummary,
  HrJobApplicationWithCandidateLean,
} from '../../utils/types/applicationTypes';
import type { PaginationResult } from '../../utils/types/jobTypes';

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

const paginateResults = <T>(
  items: T[],
  query: Pick<ApplicationListQuery, 'page' | 'limit'>,
): PaginationResult<T> => {
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 10);
  const skip = (page - 1) * limit;
  const data = items.slice(skip, skip + limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: items.length > 0 ? Math.ceil(items.length / limit) : 1,
    },
  };
};

const normalizeStatus = (value: string | undefined) => trimValue(value).toUpperCase();

const matchesSearch = (parts: Array<string | number | undefined>, searchQuery: string) => {
  if (!searchQuery) {
    return true;
  }

  return parts.join(' ').toLowerCase().includes(searchQuery);
};

const extractPopulatedJob = (
  value: unknown,
): { title?: string; experienceLevel?: string; requiredSkills?: string; description?: string } | null => {
  if (!value || typeof value !== 'object' || !('title' in value)) {
    return null;
  }

  return value as {
    title?: string;
    experienceLevel?: string;
    requiredSkills?: string;
    description?: string;
  };
};

const fetchJobForHrApplications = async (jobId: string) => {
  return JobModel.findById(jobId).lean();
};

const findApplicationsForHrJob = async (jobId: string) => {
  return ApplicationModel.find({ jobId })
    .populate({
      path: 'candidateId',
      select: POPULATED_ENTITY_EXCLUDED_FIELDS,
    })
    .sort({ createdAt: -1 })
    .lean<HrJobApplicationWithCandidateLean[]>();
};

const findCandidateProfilesByUserIds = async (candidateUserIds: Types.ObjectId[]) => {
  return CandidateProfileModel.find({ userId: { $in: candidateUserIds } }).lean<
    CandidateProfileSummary[]
  >();
};

export const getAppliedJobsForCandidate = async (
  candidateUserId: string,
  query: ApplicationListQuery,
) => {
  const applications = await ApplicationModel.find({ candidateId: candidateUserId })
    .populate('jobId')
    .sort({ createdAt: -1 })
    .lean();

  const normalizedStatus = normalizeStatus(query.status);
  const normalizedSearch = trimValue(query.search).toLowerCase();

  const filteredApplications = applications.filter((application) => {
    if (normalizedStatus && normalizeStatus(application.status) !== normalizedStatus) {
      return false;
    }

    const job = extractPopulatedJob(application.jobId);
    return matchesSearch(
      [
        job?.title,
        job?.experienceLevel,
        job?.requiredSkills,
        job?.description,
        application.status,
      ],
      normalizedSearch,
    );
  });

  return paginateResults(filteredApplications, query);
};

export const listApplicationsForHrJob = async (
  jobId: string,
  _hrUserId: string,
  query: ApplicationListQuery,
) => {
  const job = await fetchJobForHrApplications(jobId);
  assertEntityExists(job, APPLICATION_MESSAGES.JOB.NOT_FOUND);

  const applications = await findApplicationsForHrJob(jobId);

  const candidateUserIds = applications
    .map((application) => extractPopulatedCandidate(application)?._id)
    .filter(Boolean) as Types.ObjectId[];

  const candidateProfiles = await findCandidateProfilesByUserIds(candidateUserIds);
  const profileMap = buildCandidateProfileMap(candidateProfiles);
  const mappedApplications = mapHrApplicationsWithProfiles(applications, profileMap);
  const normalizedStatus = normalizeStatus(query.status);
  const normalizedSearch = trimValue(query.search).toLowerCase();

  const filteredApplications = mappedApplications.filter((application) => {
    if (normalizedStatus && normalizeStatus(application.status) !== normalizedStatus) {
      return false;
    }

    return matchesSearch(
      [
        application.candidate.name,
        application.candidate.email,
        application.profile.skills,
        application.profile.experienceYears,
      ],
      normalizedSearch,
    );
  });

  return paginateResults(filteredApplications, query);
};
