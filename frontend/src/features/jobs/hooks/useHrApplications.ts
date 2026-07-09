import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  useGetHrJobsQuery,
  useGetJobApplicationsQuery,
  useUpdateApplicationStatusMutation,
} from '../api/jobsApi';
import { useGetInterviewersQuery } from '../../hr/api/interviewerDirectoryApi';
import type { InterviewerOption } from '../../hr/types/hrTypes';
import type {
  ApplicationStatus,
  HrJobApplication,
  JobsStatusFilter,
  PendingAction,
} from '../types/jobTypes';
import { hasScheduledInterview, normalizeApplicationStatus, sortJobs } from '../utils/jobPanelHelpers';
import { getJobsErrorMessage } from '../utils/jobValidation';
import { JOBS_DEFAULT_MESSAGES, JOBS_PANEL_TEXT, JOBS_SUCCESS_MESSAGES } from '../labels/jobLabels';
import { showToast, TOAST_TYPES } from '../../../utils/toast';

export const useHrApplications = () => {
  const [selectedApplicationsJobId, setSelectedApplicationsJobId] = useState('');
  const [applicationsJobsFilter, setApplicationsJobsFilter] = useState<JobsStatusFilter>('all');
  const [applicationsJobsSearchQuery, setApplicationsJobsSearchQuery] = useState('');
  const [applicationsStatusFilter, setApplicationsStatusFilter] = useState<'all' | ApplicationStatus>('all');
  const [applicationsSearchQuery, setApplicationsSearchQuery] = useState('');
  const [jobsPage, setJobsPage] = useState(1);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<{
    applicationId: string;
    top: number;
    left: number;
  } | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [selectedApplicationForStatusChange, setSelectedApplicationForStatusChange] =
    useState<HrJobApplication | null>(null);
  const [selectedStatusForChange, setSelectedStatusForChange] = useState<ApplicationStatus>('APPLIED');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedApplicationForSchedule, setSelectedApplicationForSchedule] =
    useState<HrJobApplication | null>(null);

  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  const deferredJobsSearchQuery = useDeferredValue(applicationsJobsSearchQuery);
  const deferredApplicationsSearchQuery = useDeferredValue(applicationsSearchQuery);
  const { data: hrJobsResponse, isLoading: isHrJobsLoading } = useGetHrJobsQuery({
    page: jobsPage,
    limit: 10,
    search: deferredJobsSearchQuery.trim() || undefined,
    isActive:
      applicationsJobsFilter === 'all' ? undefined : applicationsJobsFilter === 'active',
  });
  const { data: interviewersResponse } = useGetInterviewersQuery({ page: 1, limit: 100 });
  const { data: jobApplicationsResponse, isLoading: isJobApplicationsLoading } = useGetJobApplicationsQuery(
    {
      jobId: selectedApplicationsJobId,
      page: applicationsPage,
      limit: 10,
      search: deferredApplicationsSearchQuery.trim() || undefined,
      status: applicationsStatusFilter === 'all' ? undefined : applicationsStatusFilter,
    },
    { skip: !selectedApplicationsJobId },
  );
  const [updateApplicationStatus, { isLoading: isUpdatingApplicationStatus }] =
    useUpdateApplicationStatusMutation();

  const jobs = useMemo(() => sortJobs(hrJobsResponse?.data ?? []), [hrJobsResponse?.data]);
  const interviewerOptions: InterviewerOption[] = interviewersResponse?.data ?? [];
  const hrJobApplications = useMemo(() => jobApplicationsResponse?.data ?? [], [jobApplicationsResponse?.data]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent): void => {
      if (!actionMenuRef.current) {
        return;
      }

      if (!actionMenuRef.current.contains(event.target as Node)) {
        setActionMenuAnchor(null);
      }
    };

    document.addEventListener('mousedown', onDocumentClick);
    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
    };
  }, []);

  useEffect(() => {
    setJobsPage(1);
  }, [applicationsJobsFilter, deferredJobsSearchQuery]);

  const filteredApplicationsJobs = jobs;

  const selectedApplicationsJob = useMemo(
    () => jobs.find((job) => job._id === selectedApplicationsJobId),
    [jobs, selectedApplicationsJobId],
  );

  useEffect(() => {
    setApplicationsPage(1);
  }, [applicationsStatusFilter, deferredApplicationsSearchQuery, selectedApplicationsJobId]);

  const selectedApplicationForAction = useMemo(
    () =>
      actionMenuAnchor
        ? (hrJobApplications.find((application) => application._id === actionMenuAnchor.applicationId) ?? null)
        : null,
    [actionMenuAnchor, hrJobApplications],
  );

  const openActionMenuForRow = useCallback((applicationId: string, triggerElement: HTMLButtonElement): void => {
    const triggerRect = triggerElement.getBoundingClientRect();
    const menuWidth = 180;
    const menuHeight = 36;
    const viewportPadding = 8;
    const computedLeft = Math.max(
      viewportPadding,
      Math.min(triggerRect.right - menuWidth, window.innerWidth - menuWidth - viewportPadding),
    );
    const computedTop = Math.max(viewportPadding, triggerRect.top - menuHeight - 2);

    setActionMenuAnchor({
      applicationId,
      top: computedTop,
      left: computedLeft,
    });
  }, []);

  const openScheduleModal = useCallback(
    (application: HrJobApplication) => {
      setSelectedApplicationForSchedule(application);
      setIsScheduleModalOpen(true);
    },
    [],
  );

  const closeScheduleModal = useCallback(() => {
    setIsScheduleModalOpen(false);
    setSelectedApplicationForSchedule(null);
  }, []);

  const openChangeStatusModal = useCallback((application: HrJobApplication): void => {
    if (hasScheduledInterview(application)) {
      setActionMenuAnchor(null);
      showToast({
        type: TOAST_TYPES.ERROR,
        message: JOBS_PANEL_TEXT.CANCEL_INTERVIEW_BEFORE_STATUS_CHANGE,
      });
      return;
    }

    setActionMenuAnchor(null);
    setSelectedApplicationForStatusChange(application);
    setSelectedStatusForChange(normalizeApplicationStatus(application.status));
    setIsChangeStatusModalOpen(true);
  }, []);

  const closeChangeStatusModal = useCallback(() => {
    setIsChangeStatusModalOpen(false);
    setSelectedApplicationForStatusChange(null);
  }, []);

  const closeConfirmationModal = useCallback(() => {
    setPendingAction(null);
  }, []);

  const onRequestStatusChangeUpdate = useCallback(() => {
    if (!selectedApplicationForStatusChange) {
      return;
    }

    closeChangeStatusModal();
    setPendingAction({
      application: selectedApplicationForStatusChange,
      status: selectedStatusForChange,
    });
  }, [closeChangeStatusModal, selectedApplicationForStatusChange, selectedStatusForChange]);

  const onUpdateApplicationStatus = useCallback(
    async (applicationId: string, status: ApplicationStatus): Promise<void> => {
      try {
        await updateApplicationStatus({ applicationId, status }).unwrap();
        showToast({
          type: TOAST_TYPES.SUCCESS,
          message: JOBS_SUCCESS_MESSAGES.APPLICATION_STATUS_UPDATED,
        });
      } catch (error) {
        showToast({
          type: TOAST_TYPES.ERROR,
          message: getJobsErrorMessage(error, JOBS_DEFAULT_MESSAGES.UPDATE_APPLICATION_STATUS_FAILED),
        });
      }
    },
    [updateApplicationStatus],
  );

  const confirmPendingAction = useCallback(async (): Promise<void> => {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.status === 'INTERVIEW_SCHEDULED') {
      setPendingAction(null);
      openScheduleModal(pendingAction.application);
      return;
    }

    await onUpdateApplicationStatus(pendingAction.application._id, pendingAction.status);
    setPendingAction(null);
  }, [onUpdateApplicationStatus, openScheduleModal, pendingAction]);

  return {
    actionMenuAnchor,
    actionMenuRef,
    applicationsJobsFilter,
    setApplicationsJobsFilter,
    applicationsJobsSearchQuery,
    setApplicationsJobsSearchQuery,
    applicationsSearchQuery,
    setApplicationsSearchQuery,
    applicationsStatusFilter,
    setApplicationsStatusFilter,
    closeChangeStatusModal,
    closeConfirmationModal,
    closeScheduleModal,
    confirmPendingAction,
    filteredApplicationsJobs,
    filteredHrJobApplications: hrJobApplications,
    interviewerOptions,
    isChangeStatusModalOpen,
    isHrJobsLoading,
    isJobApplicationsLoading,
    isScheduleModalOpen,
    isUpdatingApplicationStatus,
    jobsPagination: hrJobsResponse?.pagination,
    applicationsPagination: jobApplicationsResponse?.pagination,
    jobsPage,
    setJobsPage,
    applicationsPage,
    setApplicationsPage,
    normalizeApplicationStatus,
    onRequestStatusChangeUpdate,
    openActionMenuForRow,
    openChangeStatusModal,
    pendingAction,
    selectedApplicationForAction,
    selectedApplicationForSchedule,
    selectedApplicationForStatusChange,
    selectedApplicationsJob,
    selectedApplicationsJobId,
    selectedStatusForChange,
    setActionMenuAnchor,
    setSelectedApplicationsJobId,
    setSelectedStatusForChange,
  };
};
