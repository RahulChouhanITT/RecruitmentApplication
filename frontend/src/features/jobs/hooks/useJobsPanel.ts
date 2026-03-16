import { useEffect, useMemo, useRef, useState } from "react";
import {
  useActivateJobMutation,
  useApplyForJobMutation,
  useCloseJobMutation,
  useCreateJobMutation,
  useGetAppliedJobsQuery,
  useGetCandidateJobsQuery,
  useGetHrJobsQuery,
  useGetJobApplicationsQuery,
  useScheduleInterviewMutation,
  useUpdateApplicationStatusMutation,
  useUpdateJobMutation,
} from "../api/jobsApi";
import { useGetInterviewersQuery } from "../../auth/api/authApi";
import type { InterviewerOption } from "../../auth/types/authTypes";
import { JOBS_FIELD_LIMITS, JOBS_INITIAL_VALUES } from "../constants/jobConstants";
import { JOBS_DEFAULT_MESSAGES, JOBS_PANEL_TEXT, JOBS_SUCCESS_MESSAGES, JOBS_VALIDATION_MESSAGES } from "../labels/jobLabels";
import type { ApplicationStatus, CreateJobPayload, HrJobApplication, Job, JobsPanelProps, JobsStatusFilter, PendingAction, ScheduleInterviewFormValues } from "../types/jobTypes";
import {
  formatPostedAt,
  hasScheduledInterview,
  initialScheduleFormValues,
  normalizeApplicationStatus,
  normalizeExperienceLevel,
} from "../utils/jobPanelHelpers";
import { getJobsErrorMessage, validateJobFormValues, validateScheduleFormValues } from "../utils/jobValidation";
import { showToast, TOAST_TYPES } from "../../../utils/toast";

export const useJobsPanel = ({ role, activePanelId }: JobsPanelProps) => {
  const isHr = role === "hr";
  const isCandidate = role === "candidate";
  const isHrManageView = activePanelId === "hr-jobs-manage" || !activePanelId;
  const isHrApplicationsView = activePanelId === "hr-jobs-applications";
  const [allJobsFilter, setAllJobsFilter] = useState<JobsStatusFilter>("all");
  const [manageSearchQuery, setManageSearchQuery] = useState<string>(JOBS_INITIAL_VALUES.EMPTY_STRING);
  const [selectedApplicationsJobId, setSelectedApplicationsJobId] = useState<string>(JOBS_INITIAL_VALUES.EMPTY_STRING);
  const [applicationsJobsFilter, setApplicationsJobsFilter] = useState<JobsStatusFilter>("all");
  const [applicationsJobsSearchQuery, setApplicationsJobsSearchQuery] = useState<string>(JOBS_INITIAL_VALUES.EMPTY_STRING);
  const [applicationsStatusFilter, setApplicationsStatusFilter] = useState<"all" | ApplicationStatus>("all");
  const [applicationsSearchQuery, setApplicationsSearchQuery] = useState<string>(JOBS_INITIAL_VALUES.EMPTY_STRING);

  const [formValues, setFormValues] = useState<CreateJobPayload>(JOBS_INITIAL_VALUES.JOB_FORM);
  const [editingJobId, setEditingJobId] = useState<string>(JOBS_INITIAL_VALUES.EMPTY_STRING);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateJobPayload, string>>>({});
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleFormValues, setScheduleFormValues] = useState<ScheduleInterviewFormValues>(initialScheduleFormValues);
  const [scheduleFormErrors, setScheduleFormErrors] = useState<Partial<Record<keyof ScheduleInterviewFormValues, string>>>({});
  const [selectedApplicationForSchedule, setSelectedApplicationForSchedule] = useState<HrJobApplication | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<{ applicationId: string; top: number; left: number } | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [selectedApplicationForStatusChange, setSelectedApplicationForStatusChange] = useState<HrJobApplication | null>(null);
  const [selectedStatusForChange, setSelectedStatusForChange] = useState<ApplicationStatus>("APPLIED");
  const [pendingJobStatusAction, setPendingJobStatusAction] = useState<{ jobId: string; action: "Close" | "Activate" } | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  const { data: hrJobsResponse, isLoading: isHrJobsLoading } = useGetHrJobsQuery(undefined, { skip: !isHr });
  const { data: candidateJobsResponse, isLoading: isCandidateJobsLoading } = useGetCandidateJobsQuery(undefined, { skip: !isCandidate });
  const { data: appliedJobsResponse } = useGetAppliedJobsQuery(undefined, { skip: !isCandidate });
  const { data: interviewersResponse } = useGetInterviewersQuery(undefined, { skip: !isHr });
  const { data: jobApplicationsResponse, isLoading: isJobApplicationsLoading } = useGetJobApplicationsQuery(
    { jobId: selectedApplicationsJobId },
    { skip: !isHr || !isHrApplicationsView || !selectedApplicationsJobId }
  );

  const [createJob, { isLoading: isCreatingJob }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdatingJob }] = useUpdateJobMutation();
  const [closeJob, { isLoading: isClosingJob }] = useCloseJobMutation();
  const [activateJob, { isLoading: isActivatingJob }] = useActivateJobMutation();
  const [applyForJob, { isLoading: isApplyingJob }] = useApplyForJobMutation();
  const [updateApplicationStatus, { isLoading: isUpdatingApplicationStatus }] = useUpdateApplicationStatusMutation();
  const [scheduleInterview, { isLoading: isSchedulingInterview }] = useScheduleInterviewMutation();

  const interviewerOptions: InterviewerOption[] = interviewersResponse?.data ?? [];

  const selectedInterviewDate = useMemo(() => {
    if (!scheduleFormValues.selectedDateTime) {
      return "";
    }
    const year = scheduleFormValues.selectedDateTime.getFullYear();
    const month = String(scheduleFormValues.selectedDateTime.getMonth() + 1).padStart(2, "0");
    const day = String(scheduleFormValues.selectedDateTime.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [scheduleFormValues.selectedDateTime]);

  const selectedInterviewTime = useMemo(() => {
    if (!scheduleFormValues.selectedDateTime) {
      return "";
    }
    const hours = String(scheduleFormValues.selectedDateTime.getHours()).padStart(2, "0");
    const minutes = String(scheduleFormValues.selectedDateTime.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }, [scheduleFormValues.selectedDateTime]);

  const jobs = useMemo<Job[]>(
    () => (isHr ? hrJobsResponse?.data ?? [] : candidateJobsResponse?.data ?? []),
    [candidateJobsResponse?.data, hrJobsResponse?.data, isHr]
  );

  const visibleJobs = useMemo<Job[]>(
    () =>
      [...jobs].sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return a.isActive ? -1 : 1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [jobs]
  );

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent): void => {
      if (!actionMenuRef.current) {
        return;
      }
      const targetNode = event.target as Node;
      const clickedInsideMenu = actionMenuRef.current.contains(targetNode);
      if (!clickedInsideMenu) {
        setActionMenuAnchor(null);
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
    };
  }, []);

  const appliedJobIds = useMemo(() => {
    if (!isCandidate) {
      return new Set<string>();
    }

    return new Set(
      (appliedJobsResponse?.data ?? [])
        .map((application) => (typeof application.jobId === "string" ? application.jobId : application.jobId?._id))
        .filter(Boolean) as string[]
    );
  }, [appliedJobsResponse?.data, isCandidate]);

  const updateFormValue = (key: keyof CreateJobPayload, value: string): void => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (key === "description") {
      const descriptionWords = value.trim().split(/\s+/).filter(Boolean).length;

      if (descriptionWords > JOBS_FIELD_LIMITS.descriptionWords) {
        setFormErrors((prev) => ({
          ...prev,
          description: JOBS_VALIDATION_MESSAGES.DESCRIPTION_WORD_LIMIT(JOBS_FIELD_LIMITS.descriptionWords),
        }));
        return;
      }
    }

    setFormErrors((prev) => ({ ...prev, [key]: JOBS_INITIAL_VALUES.EMPTY_STRING }));
  };

  const resetForm = (): void => {
    setFormValues(JOBS_INITIAL_VALUES.JOB_FORM);
    setEditingJobId(JOBS_INITIAL_VALUES.EMPTY_STRING);
    setIsModalOpen(false);
    setFormErrors({});
  };

  const validateJobForm = (): boolean => {
    const nextErrors = validateJobFormValues(formValues);
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitHrJob = async (): Promise<void> => {
    if (!validateJobForm()) {
      return;
    }

    try {
      if (editingJobId) {
        await updateJob({ jobId: editingJobId, payload: formValues }).unwrap();
        showToast({ type: TOAST_TYPES.SUCCESS, message: JOBS_SUCCESS_MESSAGES.JOB_UPDATED });
      } else {
        await createJob(formValues).unwrap();
        showToast({ type: TOAST_TYPES.SUCCESS, message: JOBS_SUCCESS_MESSAGES.JOB_CREATED });
      }

      resetForm();
    } catch (error) {
      showToast({ type: TOAST_TYPES.ERROR, message: getJobsErrorMessage(error, JOBS_DEFAULT_MESSAGES.SAVE_JOB_FAILED) });
    }
  };

  const onEditJob = (job: Job): void => {
    setEditingJobId(job._id);
    setFormValues({
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills,
      experienceLevel: normalizeExperienceLevel(job.experienceLevel),
    });
    setIsModalOpen(true);
  };

  const onOpenCreateModal = (): void => {
    setEditingJobId(JOBS_INITIAL_VALUES.EMPTY_STRING);
    setFormValues(JOBS_INITIAL_VALUES.JOB_FORM);
    setIsModalOpen(true);
  };

  const onCloseJob = async (jobId: string): Promise<void> => {
    try {
      await closeJob({ jobId }).unwrap();
      showToast({ type: TOAST_TYPES.SUCCESS, message: JOBS_SUCCESS_MESSAGES.JOB_CLOSED });
    } catch (error) {
      showToast({ type: TOAST_TYPES.ERROR, message: getJobsErrorMessage(error, JOBS_DEFAULT_MESSAGES.CLOSE_JOB_FAILED) });
    }
  };

  const onActivateJob = async (jobId: string): Promise<void> => {
    try {
      await activateJob({ jobId }).unwrap();
      showToast({ type: TOAST_TYPES.SUCCESS, message: JOBS_SUCCESS_MESSAGES.JOB_ACTIVATED });
    } catch (error) {
      showToast({ type: TOAST_TYPES.ERROR, message: getJobsErrorMessage(error, JOBS_DEFAULT_MESSAGES.ACTIVATE_JOB_FAILED) });
    }
  };

  const onApply = async (jobId: string): Promise<void> => {
    try {
      await applyForJob({ jobId }).unwrap();
      showToast({ type: TOAST_TYPES.SUCCESS, message: JOBS_DEFAULT_MESSAGES.APPLY_SUCCESS });
    } catch (error) {
      showToast({ type: TOAST_TYPES.ERROR, message: getJobsErrorMessage(error, JOBS_DEFAULT_MESSAGES.APPLY_FAILED) });
    }
  };

  const onUpdateApplicationStatus = async (applicationId: string, status: ApplicationStatus): Promise<void> => {
    try {
      await updateApplicationStatus({ applicationId, status }).unwrap();
      showToast({ type: TOAST_TYPES.SUCCESS, message: JOBS_SUCCESS_MESSAGES.APPLICATION_STATUS_UPDATED });
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getJobsErrorMessage(error, JOBS_DEFAULT_MESSAGES.UPDATE_APPLICATION_STATUS_FAILED),
      });
    }
  };

  const openScheduleInterviewModal = (application: HrJobApplication): void => {
    setSelectedApplicationForSchedule(application);
    setScheduleFormValues({
      ...initialScheduleFormValues,
      interviewerId: interviewerOptions[0]?._id ?? JOBS_INITIAL_VALUES.EMPTY_STRING,
    });
    setScheduleFormErrors({});
    setIsScheduleModalOpen(true);
  };

  const closeScheduleInterviewModal = (): void => {
    setIsScheduleModalOpen(false);
    setSelectedApplicationForSchedule(null);
    setScheduleFormErrors({});
  };

  const validateScheduleForm = (): boolean => {
    const nextErrors = validateScheduleFormValues(scheduleFormValues);
    setScheduleFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const requestStatusAction = (application: HrJobApplication, status: ApplicationStatus): void => {
    if (hasScheduledInterview(application)) {
      setActionMenuAnchor(null);
      showToast({
        type: TOAST_TYPES.ERROR,
        message: JOBS_PANEL_TEXT.CANCEL_INTERVIEW_BEFORE_STATUS_CHANGE,
      });
      return;
    }

    setActionMenuAnchor(null);
    setPendingAction({ application, status });
  };

  const openChangeStatusModal = (application: HrJobApplication): void => {
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
  };

  const closeChangeStatusModal = (): void => {
    setIsChangeStatusModalOpen(false);
    setSelectedApplicationForStatusChange(null);
  };

  const closeConfirmationModal = (): void => {
    setPendingAction(null);
  };

  const confirmPendingAction = async (): Promise<void> => {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.status === "INTERVIEW_SCHEDULED") {
      openScheduleInterviewModal(pendingAction.application);
      setPendingAction(null);
      return;
    }

    await onUpdateApplicationStatus(pendingAction.application._id, pendingAction.status);
    setPendingAction(null);
  };

  const onRequestStatusChangeUpdate = (): void => {
    if (!selectedApplicationForStatusChange) {
      return;
    }

    closeChangeStatusModal();
    setPendingAction({
      application: selectedApplicationForStatusChange,
      status: selectedStatusForChange,
    });
  };

  const onSubmitScheduleInterview = async (): Promise<void> => {
    if (!selectedApplicationForSchedule || !validateScheduleForm()) {
      return;
    }

    try {
      await scheduleInterview({
        applicationId: selectedApplicationForSchedule._id,
        payload: {
          interviewDate: selectedInterviewDate,
          interviewTime: selectedInterviewTime,
          interviewerId: scheduleFormValues.interviewerId.trim(),
          notes: scheduleFormValues.notes.trim(),
        },
      }).unwrap();

      showToast({ type: TOAST_TYPES.SUCCESS, message: JOBS_SUCCESS_MESSAGES.INTERVIEW_SCHEDULED });
      closeScheduleInterviewModal();
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getJobsErrorMessage(error, JOBS_DEFAULT_MESSAGES.SCHEDULE_INTERVIEW_FAILED),
      });
    }
  };

  const filteredAllJobs = useMemo(() => {
    const normalizedQuery = manageSearchQuery.trim().toLowerCase();
    return visibleJobs.filter((job) => {
      const matchesStatus =
        allJobsFilter === "all" || (allJobsFilter === "active" && job.isActive) || (allJobsFilter === "closed" && !job.isActive);

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchable = [job.title, job.requiredSkills, job.experienceLevel, job.description].join(" ").toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [allJobsFilter, manageSearchQuery, visibleJobs]);

  const filteredApplicationsJobs = useMemo(() => {
    const normalizedQuery = applicationsJobsSearchQuery.trim().toLowerCase();
    return visibleJobs.filter((job) => {
      const matchesStatus =
        applicationsJobsFilter === "all" ||
        (applicationsJobsFilter === "active" && job.isActive) ||
        (applicationsJobsFilter === "closed" && !job.isActive);

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchable = [job.title, job.requiredSkills, job.experienceLevel].join(" ").toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [applicationsJobsFilter, applicationsJobsSearchQuery, visibleJobs]);

  const jobsToRender = isCandidate ? visibleJobs : isHrManageView ? filteredAllJobs : [];
  const jobsEmptyMessage =
    isHrManageView && allJobsFilter !== "all" ? JOBS_PANEL_TEXT.NO_FILTERED_JOBS(allJobsFilter) : JOBS_PANEL_TEXT.NO_JOBS;
  const selectedApplicationsJob = visibleJobs.find((job) => job._id === selectedApplicationsJobId);
  const hrJobApplications = jobApplicationsResponse?.data ?? [];

  const filteredHrJobApplications = useMemo(() => {
    const normalizedQuery = applicationsSearchQuery.trim().toLowerCase();
    return hrJobApplications.filter((application) => {
      const normalizedStatus = normalizeApplicationStatus(application.status);
      const matchesStatus = applicationsStatusFilter === "all" || applicationsStatusFilter === normalizedStatus;
      if (!matchesStatus) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchable = [
        application.candidate.name,
        application.candidate.email,
        application.profile.skills,
        String(application.profile.experienceYears ?? ""),
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [applicationsSearchQuery, applicationsStatusFilter, hrJobApplications]);

  const selectedApplicationForAction = actionMenuAnchor
    ? hrJobApplications.find((application) => application._id === actionMenuAnchor.applicationId) ?? null
    : null;

  const openActionMenuForRow = (applicationId: string, triggerElement: HTMLButtonElement): void => {
    const triggerRect = triggerElement.getBoundingClientRect();
    const menuWidth = 180;
    const menuHeight = 36;
    const viewportPadding = 8;
    const computedLeft = Math.max(
      viewportPadding,
      Math.min(triggerRect.right - menuWidth, window.innerWidth - menuWidth - viewportPadding)
    );
    const computedTop = Math.max(viewportPadding, triggerRect.top - menuHeight - 2);
    setActionMenuAnchor({
      applicationId,
      top: computedTop,
      left: computedLeft,
    });
  };

  return {
    isHr,
    isCandidate,
    isHrManageView,
    isHrApplicationsView,
    allJobsFilter,
    setAllJobsFilter,
    manageSearchQuery,
    setManageSearchQuery,
    selectedApplicationsJobId,
    setSelectedApplicationsJobId,
    applicationsJobsFilter,
    setApplicationsJobsFilter,
    applicationsJobsSearchQuery,
    setApplicationsJobsSearchQuery,
    applicationsStatusFilter,
    setApplicationsStatusFilter,
    applicationsSearchQuery,
    setApplicationsSearchQuery,
    formValues,
    setFormValues,
    editingJobId,
    isModalOpen,
    setIsModalOpen,
    formErrors,
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    scheduleFormValues,
    setScheduleFormValues,
    scheduleFormErrors,
    setScheduleFormErrors,
    selectedApplicationForSchedule,
    actionMenuAnchor,
    setActionMenuAnchor,
    pendingAction,
    setPendingAction,
    isChangeStatusModalOpen,
    selectedApplicationForStatusChange,
    selectedStatusForChange,
    setSelectedStatusForChange,
    pendingJobStatusAction,
    setPendingJobStatusAction,
    actionMenuRef,
    selectedInterviewDate,
    selectedInterviewTime,
    isHrJobsLoading,
    isCandidateJobsLoading,
    isJobApplicationsLoading,
    isCreatingJob,
    isUpdatingJob,
    isClosingJob,
    isActivatingJob,
    isApplyingJob,
    isUpdatingApplicationStatus,
    isSchedulingInterview,
    interviewerOptions,
    visibleJobs,
    appliedJobIds,
    updateFormValue,
    resetForm,
    submitHrJob,
    onEditJob,
    onOpenCreateModal,
    onCloseJob,
    onActivateJob,
    onApply,
    openScheduleInterviewModal,
    closeScheduleInterviewModal,
    requestStatusAction,
    openChangeStatusModal,
    closeChangeStatusModal,
    closeConfirmationModal,
    confirmPendingAction,
    onRequestStatusChangeUpdate,
    onSubmitScheduleInterview,
    filteredApplicationsJobs,
    jobsToRender,
    jobsEmptyMessage,
    selectedApplicationsJob,
    filteredHrJobApplications,
    selectedApplicationForAction,
    openActionMenuForRow,
    formatPostedAt,
    normalizeApplicationStatus,
  };
};
