import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  useApplyForJobMutation,
  useGetAppliedJobsQuery,
  useGetCandidateJobsQuery,
} from '../api/jobsApi';
import { JOBS_DEFAULT_MESSAGES } from '../labels/jobLabels';
import { getAppliedJobId, getJobErrorMessage } from '../utils/jobHelpers';
import { showToast, TOAST_TYPES } from '../../../utils/toast';
import type { JobsStatusFilter } from '../types/jobTypes';

export const useOpenJobs = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<JobsStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const { data: jobsResponse, isLoading: isJobsLoading } = useGetCandidateJobsQuery({
    page,
    limit: 10,
    search: deferredSearchQuery.trim() || undefined,
    isActive:
      statusFilter === 'all' ? undefined : statusFilter === 'active',
  });
  const { data: appliedJobsResponse } = useGetAppliedJobsQuery({ page: 1, limit: 1000 });
  const [applyForJob, { isLoading: isApplying }] = useApplyForJobMutation();
  const jobs = useMemo(() => jobsResponse?.data ?? [], [jobsResponse?.data]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearchQuery, statusFilter]);

  const appliedJobIds = useMemo(
    () =>
      new Set(
        (appliedJobsResponse?.data ?? [])
          .map((application) => getAppliedJobId(application.jobId))
          .filter(Boolean) as string[],
      ),
    [appliedJobsResponse?.data],
  );

  const onApply = async (jobId: string): Promise<void> => {
    try {
      await applyForJob({ jobId }).unwrap();
      showToast({ type: TOAST_TYPES.SUCCESS, message: JOBS_DEFAULT_MESSAGES.APPLY_SUCCESS });
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getJobErrorMessage(error, JOBS_DEFAULT_MESSAGES.APPLY_FAILED),
      });
    }
  };

  return {
    jobs,
    pagination: jobsResponse?.pagination,
    appliedJobIds,
    isJobsLoading,
    isApplying,
    page,
    setPage,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    onApply,
  };
};
