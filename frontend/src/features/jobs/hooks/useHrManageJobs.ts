import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useActivateJobMutation, useCloseJobMutation, useGetHrJobsQuery } from '../api/jobsApi';
import type { Job, JobsStatusFilter } from '../types/jobTypes';
import { formatPostedAt, sortJobs } from '../utils/jobPanelHelpers';
import { getJobsErrorMessage } from '../utils/jobValidation';
import { JOBS_PANEL_TEXT, JOBS_SUCCESS_MESSAGES, JOBS_DEFAULT_MESSAGES } from '../labels/jobLabels';
import { showToast, TOAST_TYPES } from '../../../utils/toast';

export const useHrManageJobs = () => {
  const [allJobsFilter, setAllJobsFilter] = useState<JobsStatusFilter>('all');
  const [manageSearchQuery, setManageSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [pendingJobStatusAction, setPendingJobStatusAction] = useState<{
    jobId: string;
    action: 'Close' | 'Activate';
  } | null>(null);
  const deferredSearchQuery = useDeferredValue(manageSearchQuery);
  const { data: hrJobsResponse, isLoading: isHrJobsLoading } = useGetHrJobsQuery({
    page,
    limit: 10,
    search: deferredSearchQuery.trim() || undefined,
    isActive: allJobsFilter === 'all' ? undefined : allJobsFilter === 'active',
  });
  const [closeJob, { isLoading: isClosingJob }] = useCloseJobMutation();
  const [activateJob, { isLoading: isActivatingJob }] = useActivateJobMutation();

  const jobs = useMemo(() => sortJobs(hrJobsResponse?.data ?? []), [hrJobsResponse?.data]);

  useEffect(() => {
    setPage(1);
  }, [allJobsFilter, deferredSearchQuery]);

  const jobsEmptyMessage =
    allJobsFilter !== 'all' ? JOBS_PANEL_TEXT.NO_FILTERED_JOBS(allJobsFilter) : JOBS_PANEL_TEXT.NO_JOBS;

  const onOpenCreateModal = useCallback(() => {
    setEditingJob(null);
    setIsCreateJobModalOpen(true);
  }, []);

  const onCloseCreateModal = useCallback(() => {
    setIsCreateJobModalOpen(false);
    setEditingJob(null);
  }, []);

  const onEditJob = useCallback((job: Job) => {
    setEditingJob(job);
    setIsCreateJobModalOpen(true);
  }, []);

  const onCloseJob = useCallback(
    async (jobId: string): Promise<void> => {
      try {
        await closeJob({ jobId }).unwrap();
        showToast({ type: TOAST_TYPES.SUCCESS, message: JOBS_SUCCESS_MESSAGES.JOB_CLOSED });
      } catch (error) {
        showToast({
          type: TOAST_TYPES.ERROR,
          message: getJobsErrorMessage(error, JOBS_DEFAULT_MESSAGES.CLOSE_JOB_FAILED),
        });
      }
    },
    [closeJob],
  );

  const onActivateJob = useCallback(
    async (jobId: string): Promise<void> => {
      try {
        await activateJob({ jobId }).unwrap();
        showToast({ type: TOAST_TYPES.SUCCESS, message: JOBS_SUCCESS_MESSAGES.JOB_ACTIVATED });
      } catch (error) {
        showToast({
          type: TOAST_TYPES.ERROR,
          message: getJobsErrorMessage(error, JOBS_DEFAULT_MESSAGES.ACTIVATE_JOB_FAILED),
        });
      }
    },
    [activateJob],
  );

  const confirmPendingJobStatusAction = useCallback(async () => {
    if (!pendingJobStatusAction) {
      return;
    }

    if (pendingJobStatusAction.action === 'Close') {
      await onCloseJob(pendingJobStatusAction.jobId);
    } else {
      await onActivateJob(pendingJobStatusAction.jobId);
    }

    setPendingJobStatusAction(null);
  }, [onActivateJob, onCloseJob, pendingJobStatusAction]);

  return {
    allJobsFilter,
    setAllJobsFilter,
    manageSearchQuery,
    setManageSearchQuery,
    isCreateJobModalOpen,
    editingJob,
    pendingJobStatusAction,
    setPendingJobStatusAction,
    jobs,
    pagination: hrJobsResponse?.pagination,
    jobsEmptyMessage,
    isHrJobsLoading,
    isClosingJob,
    isActivatingJob,
    page,
    setPage,
    onOpenCreateModal,
    onCloseCreateModal,
    onEditJob,
    confirmPendingJobStatusAction,
    formatPostedAt,
  };
};
