import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { showToast, TOAST_TYPES } from '../../../utils/toast';
import {
  useGetInterviewerInterviewsQuery,
  useSubmitInterviewFeedbackMutation,
} from '../../jobs/api/jobsApi';
import {
  INTERVIEWER_INITIAL_VALUES,
  INTERVIEWER_STATUS_VALUES,
} from '../constants/interviewerConstants';
import { INTERVIEWER_DEFAULT_MESSAGES } from '../labels/interviewerLabels';
import { getInterviewerErrorMessage } from '../handlers/interviewerErrorHandler';
import type { InterviewerInterview } from '../../jobs/types/jobTypes';

const isInterviewerInterview = (value: unknown): value is InterviewerInterview => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const interview = value as Partial<InterviewerInterview>;
  return typeof interview._id === 'string';
};

type InterviewerInterviewsPageProps = {
  initialView?: 'upcoming' | 'previous' | 'both';
};

export const useInterviewerInterviewsPage = ({
  initialView = 'both',
}: InterviewerInterviewsPageProps) => {
  const [submitFeedback, { isLoading: isSubmittingFeedback }] =
    useSubmitInterviewFeedbackMutation();
  const [selectedInterviewId, setSelectedInterviewId] = useState<string>(
    INTERVIEWER_INITIAL_VALUES.EMPTY_STRING,
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed'>(
    initialView === 'upcoming'
      ? INTERVIEWER_STATUS_VALUES.UPCOMING
      : initialView === 'previous'
        ? INTERVIEWER_STATUS_VALUES.COMPLETED_FILTER
        : INTERVIEWER_STATUS_VALUES.ALL,
  );
  const [searchQuery, setSearchQuery] = useState<string>(INTERVIEWER_INITIAL_VALUES.EMPTY_STRING);
  const [page, setPage] = useState(1);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const {
    data: interviewsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetInterviewerInterviewsQuery(
    {
      page,
      limit: 10,
      search: deferredSearchQuery.trim() || undefined,
      view: statusFilter,
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  useEffect(() => {
    setPage(1);
  }, [deferredSearchQuery, statusFilter]);

  const interviews = useMemo(() => {
    const interviewData = interviewsResponse?.data;
    return Array.isArray(interviewData) ? interviewData.filter(isInterviewerInterview) : [];
  }, [interviewsResponse]);

  const onSubmitFeedback = async (payload: {
    rating: number;
    comments?: string;
    recommendation: 'HIRED' | 'REJECTED';
  }): Promise<void> => {
    if (!selectedInterviewId) {
      return;
    }

    try {
      await submitFeedback({ interviewId: selectedInterviewId, ...payload }).unwrap();
      await refetch();
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: INTERVIEWER_DEFAULT_MESSAGES.FEEDBACK_SUBMITTED_SUCCESS,
      });
      setSelectedInterviewId(INTERVIEWER_INITIAL_VALUES.EMPTY_STRING);
    } catch (submitError) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getInterviewerErrorMessage(
          submitError,
          INTERVIEWER_DEFAULT_MESSAGES.FEEDBACK_SUBMIT_FAILED,
        ),
      });
    }
  };

  return {
    isLoading,
    isError,
    error,
    interviews,
    pagination: interviewsResponse?.pagination,
    isSubmittingFeedback,
    page,
    setPage,
    selectedInterviewId,
    setSelectedInterviewId,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    onSubmitFeedback,
  };
};
