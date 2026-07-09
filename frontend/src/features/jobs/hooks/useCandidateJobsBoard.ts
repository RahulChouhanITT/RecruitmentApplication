import { useCallback, useMemo } from 'react';
import {
  useApplyForJobMutation,
  useGetAppliedJobsQuery,
  useGetCandidateJobsQuery,
} from '../api/jobsApi';
import type { Job } from '../types/jobTypes';
import { formatPostedAt } from '../utils/jobPanelHelpers';
import { getJobsErrorMessage } from '../utils/jobValidation';
import { JOBS_DEFAULT_MESSAGES } from '../labels/jobLabels';
import { showToast, TOAST_TYPES } from '../../../utils/toast';

const sortJobs = (jobs: Job[]): Job[] =>
  [...jobs].sort((a, b) => {
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

export const useCandidateJobsBoard = () => {
  const { data: candidateJobsResponse, isLoading: isCandidateJobsLoading } =
    useGetCandidateJobsQuery();
  const { data: appliedJobsResponse } = useGetAppliedJobsQuery();
  const [applyForJob, { isLoading: isApplyingJob }] = useApplyForJobMutation();

  const jobs = useMemo(() => sortJobs(candidateJobsResponse?.data ?? []), [candidateJobsResponse?.data]);

  const appliedJobIds = useMemo(
    () =>
      new Set(
        (appliedJobsResponse?.data ?? [])
          .map((application) =>
            typeof application.jobId === 'string' ? application.jobId : application.jobId?._id,
          )
          .filter(Boolean) as string[],
      ),
    [appliedJobsResponse?.data],
  );

  const onApply = useCallback(
    async (jobId: string): Promise<void> => {
      try {
        await applyForJob({ jobId }).unwrap();
        showToast({ type: TOAST_TYPES.SUCCESS, message: JOBS_DEFAULT_MESSAGES.APPLY_SUCCESS });
      } catch (error) {
        showToast({
          type: TOAST_TYPES.ERROR,
          message: getJobsErrorMessage(error, JOBS_DEFAULT_MESSAGES.APPLY_FAILED),
        });
      }
    },
    [applyForJob],
  );

  return {
    jobs,
    appliedJobIds,
    isCandidateJobsLoading,
    isApplyingJob,
    jobsEmptyMessage: JOBS_DEFAULT_MESSAGES.NO_OPEN_JOBS_DESCRIPTION,
    onApply,
    formatPostedAt,
  };
};
