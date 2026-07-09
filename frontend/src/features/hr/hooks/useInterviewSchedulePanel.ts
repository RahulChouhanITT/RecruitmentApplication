import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useGetInterviewersQuery } from '../api/interviewerDirectoryApi';
import {
  useCancelInterviewMutation,
  useGetHrInterviewFeedbackQuery,
  useGetHrInterviewsQuery,
  useScheduleInterviewMutation,
  useUpdateApplicationStatusMutation,
} from '../../jobs/api/jobsApi';
import type { HrInterview } from '../../jobs/types/jobTypes';
import { HR_INTERVIEW_INITIAL_VALUES } from '../constants/hrConstants';
import { getHrErrorMessage } from '../handlers/hrErrorHandler';
import {
  HR_INTERVIEW_DEFAULT_MESSAGES,
  HR_INTERVIEW_SUCCESS_MESSAGES,
} from '../labels/hrLabels';
import type {
  HrFeedbackStatusFilter,
  HrInterviewActionMenuAnchor,
  InterviewerOption,
  HrInterviewScheduleFormValues,
  HrInterviewStatusFilter,
} from '../types/hrTypes';
import {
  findInterviewerIdByName,
  getInterviewActionMenuAnchor,
  toInterviewDate,
  toInterviewTime,
  toScheduledDateTime,
  validateHrScheduleForm,
} from '../utils/hrInterviewHelpers';
import { showToast, TOAST_TYPES } from '../../../utils/toast';

const INTERVIEWER_DIRECTORY_PAGE_SIZE = 10;
const HR_INTERVIEWS_PAGE_SIZE = 10;

export const useInterviewSchedulePanel = () => {
  const [interviewsPage, setInterviewsPage] = useState(1);
  const [interviewStatusFilter, setInterviewStatusFilter] =
    useState<HrInterviewStatusFilter>('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<HrFeedbackStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>(
    HR_INTERVIEW_INITIAL_VALUES.SEARCH_QUERY,
  );
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const { data, isLoading, refetch } = useGetHrInterviewsQuery(
    {
      page: interviewsPage,
      limit: HR_INTERVIEWS_PAGE_SIZE,
      search: deferredSearchQuery.trim() || undefined,
      status: interviewStatusFilter === 'all' ? undefined : interviewStatusFilter,
      feedbackStatus: feedbackStatusFilter === 'all' ? undefined : feedbackStatusFilter,
    },
    {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    },
  );
  const [interviewerPage, setInterviewerPage] = useState(1);
  const { data: interviewerResponse, isFetching: isInterviewersLoading } = useGetInterviewersQuery({
    page: interviewerPage,
    limit: INTERVIEWER_DIRECTORY_PAGE_SIZE,
  });
  const [updateApplicationStatus, { isLoading: isUpdatingStatus }] =
    useUpdateApplicationStatusMutation();
  const [scheduleInterview, { isLoading: isSchedulingInterview }] = useScheduleInterviewMutation();
  const [cancelInterview, { isLoading: isCancellingInterview }] = useCancelInterviewMutation();
  const [selectedInterviewId, setSelectedInterviewId] = useState<string>(
    HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING,
  );
  const [finalizedInterviewIds, setFinalizedInterviewIds] = useState<Set<string>>(new Set());
  const [actionMenuAnchor, setActionMenuAnchor] = useState<HrInterviewActionMenuAnchor | null>(
    null,
  );
  const [selectedInterviewForSchedule, setSelectedInterviewForSchedule] =
    useState<HrInterview | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleFormValues, setScheduleFormValues] = useState<HrInterviewScheduleFormValues>({
    ...HR_INTERVIEW_INITIAL_VALUES.SCHEDULE_FORM,
  });
  const [scheduleFormErrors, setScheduleFormErrors] = useState<
    Partial<Record<keyof HrInterviewScheduleFormValues, string>>
  >({});
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  const {
    data: feedbackResponse,
    isFetching: isFeedbackLoading,
    error: feedbackError,
  } = useGetHrInterviewFeedbackQuery(
    { interviewId: selectedInterviewId },
    { skip: !selectedInterviewId },
  );

  const interviewerOptions: InterviewerOption[] = interviewerResponse?.data ?? [];
  const interviewerPagination = interviewerResponse?.pagination;
  const interviews = useMemo(() => data?.data ?? [], [data?.data]);
  const interviewsPagination = data?.pagination;
  const feedback = feedbackResponse?.data;

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent): void => {
      if (!actionMenuRef.current) {
        return;
      }

      const targetNode = event.target as Node;
      if (!actionMenuRef.current.contains(targetNode)) {
        setActionMenuAnchor(null);
      }
    };

    document.addEventListener('mousedown', onDocumentClick);
    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
    };
  }, []);

  const selectedInterview = interviews.find((interview) => interview._id === selectedInterviewId);
  const selectedInterviewForAction = actionMenuAnchor
    ? (interviews.find((interview) => interview._id === actionMenuAnchor.interviewId) ?? null)
    : null;
  const canDecideFromFeedback = selectedInterview?.applicationStatus === 'INTERVIEW_SCHEDULED';
  const isFinalDecision =
    selectedInterview?.applicationStatus === 'HIRED' ||
    selectedInterview?.applicationStatus === 'REJECTED';
  const selectedFeedbackStatus =
    feedback?.feedbackStatus ?? selectedInterview?.feedbackStatus ?? 'PENDING';
  const isDecisionLocked = selectedInterviewId
    ? finalizedInterviewIds.has(selectedInterviewId) || isFinalDecision
    : false;

  useEffect(() => {
    setInterviewsPage(1);
  }, [deferredSearchQuery, feedbackStatusFilter, interviewStatusFilter]);

  const openActionMenuForRow = (interviewId: string, triggerElement: HTMLButtonElement): void => {
    setActionMenuAnchor(getInterviewActionMenuAnchor(interviewId, triggerElement));
  };

  const closeScheduleModal = (): void => {
    if (isSchedulingInterview) {
      return;
    }

    setInterviewerPage(1);
    setIsScheduleModalOpen(false);
    setSelectedInterviewForSchedule(null);
    setScheduleFormErrors({});
  };

  const openRescheduleModal = (interview: HrInterview): void => {
    setActionMenuAnchor(null);
    setInterviewerPage(1);
    setSelectedInterviewForSchedule(interview);
    setScheduleFormValues({
      selectedDateTime: toScheduledDateTime(interview.interviewDate, interview.interviewTime),
      durationMinutes: HR_INTERVIEW_INITIAL_VALUES.SCHEDULE_FORM.durationMinutes,
      interviewerId: findInterviewerIdByName(interview.interviewerName, interviewerOptions),
      notes: interview.notes ?? HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING,
    });
    setScheduleFormErrors({});
    setIsScheduleModalOpen(true);
  };

  const onSubmitReschedule = async (): Promise<void> => {
    if (!selectedInterviewForSchedule) {
      return;
    }

    const nextErrors = validateHrScheduleForm(scheduleFormValues);
    setScheduleFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await scheduleInterview({
        applicationId: selectedInterviewForSchedule.applicationId,
        payload: {
          interviewDate: toInterviewDate(scheduleFormValues.selectedDateTime),
          interviewTime: toInterviewTime(scheduleFormValues.selectedDateTime),
          interviewerId: scheduleFormValues.interviewerId.trim(),
          notes: scheduleFormValues.notes.trim(),
        },
      }).unwrap();

      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: HR_INTERVIEW_SUCCESS_MESSAGES.RESCHEDULED,
      });
      closeScheduleModal();
      await refetch();
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getHrErrorMessage(error, HR_INTERVIEW_DEFAULT_MESSAGES.RESCHEDULE_FAILED),
      });
    }
  };

  const onCancelInterview = async (interviewId: string): Promise<void> => {
    setActionMenuAnchor(null);

    try {
      await cancelInterview({ interviewId }).unwrap();
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: HR_INTERVIEW_SUCCESS_MESSAGES.CANCELLED,
      });
      await refetch();
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getHrErrorMessage(error, HR_INTERVIEW_DEFAULT_MESSAGES.CANCEL_INTERVIEW_FAILED),
      });
    }
  };

  const onUpdateApplicationDecision = async (status: 'HIRED' | 'REJECTED'): Promise<void> => {
    if (!selectedInterview?.applicationId) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: HR_INTERVIEW_DEFAULT_MESSAGES.FEEDBACK_MISSING_APPLICATION,
      });
      return;
    }

    try {
      await updateApplicationStatus({
        applicationId: selectedInterview.applicationId,
        status,
      }).unwrap();

      setFinalizedInterviewIds((prev) => new Set(prev).add(selectedInterviewId));
      await refetch();
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message:
          status === 'HIRED'
            ? HR_INTERVIEW_SUCCESS_MESSAGES.HIRED
            : HR_INTERVIEW_SUCCESS_MESSAGES.REJECTED,
      });
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getHrErrorMessage(error, HR_INTERVIEW_DEFAULT_MESSAGES.UPDATE_STATUS_FAILED),
      });
    }
  };

  return {
    interviews,
    feedback,
    isLoading,
    isFeedbackLoading,
    feedbackError,
    interviewerOptions,
    interviewerPagination,
    interviewerPage,
    setInterviewerPage,
    isInterviewersLoading,
    selectedInterviewId,
    setSelectedInterviewId,
    interviewStatusFilter,
    setInterviewStatusFilter,
    feedbackStatusFilter,
    setFeedbackStatusFilter,
    searchQuery,
    setSearchQuery,
    actionMenuAnchor,
    setActionMenuAnchor,
    selectedInterviewForSchedule,
    isScheduleModalOpen,
    scheduleFormValues,
    setScheduleFormValues,
    scheduleFormErrors,
    setScheduleFormErrors,
    actionMenuRef,
    interviewsPagination,
    interviewsPage,
    setInterviewsPage,
    selectedInterview,
    selectedInterviewForAction,
    canDecideFromFeedback,
    selectedFeedbackStatus,
    isDecisionLocked,
    isUpdatingStatus,
    isSchedulingInterview,
    isCancellingInterview,
    closeScheduleModal,
    openRescheduleModal,
    onSubmitReschedule,
    onCancelInterview,
    onUpdateApplicationDecision,
    openActionMenuForRow,
    refetch,
  };
};
