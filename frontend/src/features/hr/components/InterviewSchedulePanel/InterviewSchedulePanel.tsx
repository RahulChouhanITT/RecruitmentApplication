import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { showToast, TOAST_TYPES } from "../../../../utils/toast";
import { SearchInput } from "../../../../shared/components/SearchInput";
import { DashboardDescription } from "../../../dashboard/pages/DashboardPage/DashboardPage.styles";
import { EmptyStateCard } from "../../../dashboard/components/EmptyStateCard/EmptyStateCard";
import { useGetInterviewersQuery } from "../../../auth/api/authApi";
import type { InterviewerOption } from "../../../auth/types";
import {
  useCancelInterviewMutation,
  useGetHrInterviewFeedbackQuery,
  useGetHrInterviewsQuery,
  useScheduleInterviewMutation,
  useUpdateApplicationStatusMutation,
} from "../../../jobs/api/jobsApi";
import type { HrInterview } from "../../../jobs/types";
import { HR_INTERVIEW_INITIAL_VALUES } from "../../constants";
import {
  HR_INTERVIEW_DEFAULT_MESSAGES,
  HR_INTERVIEW_FILTER_OPTIONS,
  HR_INTERVIEW_SUCCESS_MESSAGES,
  HR_INTERVIEW_UI_TEXT,
  HR_INTERVIEW_VALIDATION_MESSAGES,
} from "../../labels";
import type {
  HrFeedbackStatusFilter,
  HrInterviewActionMenuAnchor,
  HrInterviewScheduleFormValues,
  HrInterviewStatusFilter,
} from "../../types";
import {
  CandidateCell,
  CloseButton,
  ControlsRow,
  DecisionActions,
  DecisionButton,
  DecisionTag,
  FeedbackActions,
  FeedbackCard,
  FeedbackLine,
  FeedbackOverlay,
  FeedbackStatusButton,
  FeedbackTitle,
  FilterRow,
  FilterSelect,
  FloatingMenuDropdown,
  InterviewsTable,
  InterviewsTableWrap,
  MenuContainer,
  MenuOption,
  MenuTrigger,
  PrimaryButton,
  ScheduleActions,
  ScheduleError,
  ScheduleField,
  ScheduleFormGrid,
  ScheduleInput,
  ScheduleLabel,
  ScheduleModalCard,
  ScheduleSection,
  ScheduleSelect,
  ScheduleTextarea,
  ScheduleTimeLayout,
  ScheduleTitle,
  ScheduleWrap,
  StatusBadge,
  StickyHeader,
  DurationButton,
  DurationGroup,
} from "./InterviewSchedulePanel.styles";

const formatFeedbackStatus = (status?: string): string => {
  const normalized = (status ?? HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING).trim().toUpperCase();

  if (normalized === "NEEDS_REVIEW") {
    return "Needs Review";
  }
  if (normalized === "REVIEWED") {
    return "Reviewed";
  }
  if (normalized === "PENDING") {
    return "Pending";
  }

  return HR_INTERVIEW_DEFAULT_MESSAGES.SUBMITTED_ON_FALLBACK;
};

const canOpenFeedbackModal = (status?: string): boolean => {
  const normalized = (status ?? HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING).trim().toUpperCase();
  return normalized === "NEEDS_REVIEW" || normalized === "REVIEWED";
};

const getInterviewTone = (status?: string): "scheduled" | "completed" | "cancelled" => {
  const normalized = (status ?? HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING).trim().toUpperCase();

  if (normalized === "COMPLETED") {
    return "completed";
  }
  if (normalized === "CANCELLED") {
    return "cancelled";
  }

  return "scheduled";
};

const getInterviewStatusLabel = (status?: string): string => {
  const tone = getInterviewTone(status);

  if (tone === "completed") {
    return HR_INTERVIEW_UI_TEXT.COMPLETED;
  }
  if (tone === "cancelled") {
    return HR_INTERVIEW_UI_TEXT.CANCELLED;
  }

  return HR_INTERVIEW_UI_TEXT.SCHEDULED;
};

const toScheduledDateTime = (interviewDate: string, interviewTime: string): Date | null => {
  const parsed = new Date(`${interviewDate}T${interviewTime}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toInterviewDate = (selectedDateTime: Date | null): string => {
  if (!selectedDateTime) {
    return HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING;
  }

  const year = selectedDateTime.getFullYear();
  const month = String(selectedDateTime.getMonth() + 1).padStart(2, "0");
  const day = String(selectedDateTime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toInterviewTime = (selectedDateTime: Date | null): string => {
  if (!selectedDateTime) {
    return HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING;
  }

  const hours = String(selectedDateTime.getHours()).padStart(2, "0");
  const minutes = String(selectedDateTime.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const findInterviewerIdByName = (
  interviewerName: string,
  interviewerOptions: InterviewerOption[]
): string => {
  const matchedInterviewer = interviewerOptions.find(
    (interviewer) => interviewer.name.trim().toLowerCase() === interviewerName.trim().toLowerCase()
  );

  return matchedInterviewer?._id ?? HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING;
};

export const InterviewSchedulePanel = () => {
  const { data, isLoading, refetch } = useGetHrInterviewsQuery();
  const { data: interviewerResponse } = useGetInterviewersQuery();
  const [updateApplicationStatus, { isLoading: isUpdatingStatus }] = useUpdateApplicationStatusMutation();
  const [scheduleInterview, { isLoading: isSchedulingInterview }] = useScheduleInterviewMutation();
  const [cancelInterview, { isLoading: isCancellingInterview }] = useCancelInterviewMutation();
  const [selectedInterviewId, setSelectedInterviewId] = useState(HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING);
  const [interviewStatusFilter, setInterviewStatusFilter] = useState<HrInterviewStatusFilter>("all");
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<HrFeedbackStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState(HR_INTERVIEW_INITIAL_VALUES.SEARCH_QUERY);
  const [finalizedInterviewIds, setFinalizedInterviewIds] = useState<Set<string>>(new Set());
  const [actionMenuAnchor, setActionMenuAnchor] = useState<HrInterviewActionMenuAnchor | null>(null);
  const [selectedInterviewForSchedule, setSelectedInterviewForSchedule] = useState<HrInterview | null>(null);
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
    { skip: !selectedInterviewId }
  );

  const interviewerOptions = interviewerResponse?.data ?? [];
  const interviews = data?.data ?? [];
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

    document.addEventListener("mousedown", onDocumentClick);
    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
    };
  }, []);

  const filteredInterviews = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return interviews.filter((interview) => {
      const normalizedInterviewStatus = (interview.status ?? "").trim().toUpperCase();
      const normalizedFeedbackStatus = (interview.feedbackStatus ?? "").trim().toUpperCase();

      const matchesInterviewStatus =
        interviewStatusFilter === "all" ||
        (interviewStatusFilter === "scheduled" && normalizedInterviewStatus === "SCHEDULED") ||
        (interviewStatusFilter === "completed" && normalizedInterviewStatus === "COMPLETED") ||
        (interviewStatusFilter === "cancelled" && normalizedInterviewStatus === "CANCELLED");

      const matchesFeedbackStatus =
        feedbackStatusFilter === "all" ||
        (feedbackStatusFilter === "pending" && normalizedFeedbackStatus === "PENDING") ||
        (feedbackStatusFilter === "needs_review" && normalizedFeedbackStatus === "NEEDS_REVIEW") ||
        (feedbackStatusFilter === "reviewed" && normalizedFeedbackStatus === "REVIEWED");

      if (!matchesInterviewStatus || !matchesFeedbackStatus) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchable = [
        interview.candidate.name,
        interview.candidate.email,
        interview.interviewerName,
        interview.job.title,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [feedbackStatusFilter, interviewStatusFilter, interviews, searchQuery]);

  const selectedInterview = interviews.find((interview) => interview._id === selectedInterviewId);
  const selectedInterviewForAction = actionMenuAnchor
    ? interviews.find((interview) => interview._id === actionMenuAnchor.interviewId) ?? null
    : null;
  const canDecideFromFeedback = selectedInterview?.applicationStatus === "INTERVIEW_SCHEDULED";
  const isFinalDecision =
    selectedInterview?.applicationStatus === "HIRED" || selectedInterview?.applicationStatus === "REJECTED";
  const selectedFeedbackStatus = feedback?.feedbackStatus ?? selectedInterview?.feedbackStatus ?? "PENDING";
  const isDecisionLocked = selectedInterviewId
    ? finalizedInterviewIds.has(selectedInterviewId) || isFinalDecision
    : false;

  const openActionMenuForRow = (interviewId: string, triggerElement: HTMLButtonElement): void => {
    const triggerRect = triggerElement.getBoundingClientRect();
    const menuWidth = 192;
    const menuHeight = 52;
    const viewportPadding = 8;
    const computedLeft = Math.max(
      viewportPadding,
      Math.min(triggerRect.right - menuWidth, window.innerWidth - menuWidth - viewportPadding)
    );
    const computedTop = Math.max(
      viewportPadding,
      triggerRect.top - menuHeight - 2
    );

    setActionMenuAnchor({
      interviewId,
      top: computedTop,
      left: computedLeft,
    });
  };

  const closeScheduleModal = (): void => {
    if (isSchedulingInterview) {
      return;
    }

    setIsScheduleModalOpen(false);
    setSelectedInterviewForSchedule(null);
    setScheduleFormErrors({});
  };

  const openRescheduleModal = (interview: HrInterview): void => {
    setActionMenuAnchor(null);
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

  const validateScheduleForm = (): boolean => {
    const nextErrors: Partial<Record<keyof HrInterviewScheduleFormValues, string>> = {};

    if (!scheduleFormValues.selectedDateTime) {
      nextErrors.selectedDateTime = HR_INTERVIEW_VALIDATION_MESSAGES.PICK_DATE_TIME;
    }

    if (!scheduleFormValues.interviewerId.trim()) {
      nextErrors.interviewerId = HR_INTERVIEW_VALIDATION_MESSAGES.INTERVIEWER_REQUIRED;
    }

    setScheduleFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmitReschedule = async (): Promise<void> => {
    if (!selectedInterviewForSchedule || !validateScheduleForm()) {
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
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : HR_INTERVIEW_DEFAULT_MESSAGES.RESCHEDULE_FAILED;

      showToast({ type: TOAST_TYPES.ERROR, message });
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
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : HR_INTERVIEW_DEFAULT_MESSAGES.CANCEL_INTERVIEW_FAILED;

      showToast({ type: TOAST_TYPES.ERROR, message });
    }
  };

  const onUpdateApplicationDecision = async (status: "HIRED" | "REJECTED"): Promise<void> => {
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
        message: status === "HIRED" ? HR_INTERVIEW_SUCCESS_MESSAGES.HIRED : HR_INTERVIEW_SUCCESS_MESSAGES.REJECTED,
      });
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : HR_INTERVIEW_DEFAULT_MESSAGES.UPDATE_STATUS_FAILED;
      showToast({ type: TOAST_TYPES.ERROR, message });
    }
  };

  if (isLoading) {
    return <DashboardDescription>{HR_INTERVIEW_DEFAULT_MESSAGES.LOADING}</DashboardDescription>;
  }

  if (interviews.length === 0) {
    return (
      <EmptyStateCard
        title={HR_INTERVIEW_DEFAULT_MESSAGES.NO_INTERVIEWS_TITLE}
        description={HR_INTERVIEW_DEFAULT_MESSAGES.NO_INTERVIEWS_DESCRIPTION}
      />
    );
  }

  const scheduleModalContent =
    isScheduleModalOpen && selectedInterviewForSchedule ? (
      <FeedbackOverlay>
        <ScheduleModalCard>
          <FeedbackTitle>{HR_INTERVIEW_UI_TEXT.RESCHEDULE_INTERVIEW}</FeedbackTitle>
          <ScheduleFormGrid>
            <ScheduleField style={{ gridColumn: "1 / -1" }}>
              <ScheduleLabel>{HR_INTERVIEW_UI_TEXT.SCHEDULE_DATE_TIME}</ScheduleLabel>
              <ScheduleSection>
                <ScheduleTimeLayout>
                  <DatePicker
                    selected={scheduleFormValues.selectedDateTime}
                    onChange={(value) => {
                      const nextValue = value instanceof Date && !Number.isNaN(value.getTime()) ? value : null;
                      setScheduleFormValues((prev) => ({ ...prev, selectedDateTime: nextValue }));
                      setScheduleFormErrors((prev) => ({ ...prev, selectedDateTime: undefined }));
                    }}
                    showTimeSelect
                    timeIntervals={30}
                    timeCaption={HR_INTERVIEW_UI_TEXT.TIME}
                    dateFormat="dd MMM yyyy, h:mm aa"
                    placeholderText={HR_INTERVIEW_UI_TEXT.SCHEDULE_DATE_TIME}
                    wrapperClassName="schedule-picker-wrap"
                    popperClassName="schedule-datepicker-popper"
                    calendarClassName="schedule-datepicker-calendar"
                    customInput={<ScheduleInput />}
                  />
                  <ScheduleField>
                    <ScheduleLabel>{HR_INTERVIEW_UI_TEXT.DURATION}</ScheduleLabel>
                    <DurationGroup>
                      {[30, 60, 90].map((minutes) => (
                        <DurationButton
                          key={minutes}
                          type="button"
                          $active={scheduleFormValues.durationMinutes === minutes}
                          onClick={() =>
                            setScheduleFormValues((prev) => ({
                              ...prev,
                              durationMinutes: minutes as 30 | 60 | 90,
                            }))
                          }
                        >
                          {minutes} min
                        </DurationButton>
                      ))}
                    </DurationGroup>
                  </ScheduleField>
                </ScheduleTimeLayout>
              </ScheduleSection>
              <ScheduleError>{scheduleFormErrors.selectedDateTime ?? "\u00A0"}</ScheduleError>
            </ScheduleField>

            <ScheduleField style={{ gridColumn: "1 / -1" }}>
              <ScheduleLabel>{HR_INTERVIEW_UI_TEXT.AVAILABLE_INTERVIEWERS}</ScheduleLabel>
              <ScheduleSection>
                <ScheduleSelect
                  value={scheduleFormValues.interviewerId}
                  onChange={(event) => {
                    setScheduleFormValues((prev) => ({
                      ...prev,
                      interviewerId: event.target.value,
                    }));
                    setScheduleFormErrors((prev) => ({ ...prev, interviewerId: undefined }));
                  }}
                >
                  <option value={HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING}>
                    {HR_INTERVIEW_UI_TEXT.SELECT_INTERVIEWER}
                  </option>
                  {interviewerOptions.map((interviewer) => (
                    <option key={interviewer._id} value={interviewer._id}>
                      {interviewer.name} ({interviewer.email})
                    </option>
                  ))}
                </ScheduleSelect>
              </ScheduleSection>
              <ScheduleError>{scheduleFormErrors.interviewerId ?? "\u00A0"}</ScheduleError>
            </ScheduleField>

            <ScheduleField style={{ gridColumn: "1 / -1" }}>
              <ScheduleLabel>{HR_INTERVIEW_UI_TEXT.NOTES}</ScheduleLabel>
              <ScheduleSection>
                <ScheduleTextarea
                  placeholder={HR_INTERVIEW_UI_TEXT.NOTES_PLACEHOLDER}
                  value={scheduleFormValues.notes}
                  onChange={(event) =>
                    setScheduleFormValues((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                />
              </ScheduleSection>
              <ScheduleError>{"\u00A0"}</ScheduleError>
            </ScheduleField>
          </ScheduleFormGrid>

          <ScheduleActions>
            <CloseButton type="button" onClick={closeScheduleModal} disabled={isSchedulingInterview}>
              {isSchedulingInterview ? HR_INTERVIEW_UI_TEXT.SCHEDULING : HR_INTERVIEW_UI_TEXT.CANCEL}
            </CloseButton>
            <PrimaryButton
              type="button"
              onClick={() => void onSubmitReschedule()}
              disabled={isSchedulingInterview}
            >
              {isSchedulingInterview ? HR_INTERVIEW_UI_TEXT.SCHEDULING : HR_INTERVIEW_UI_TEXT.RESCHEDULE_ACTION}
            </PrimaryButton>
          </ScheduleActions>
        </ScheduleModalCard>
      </FeedbackOverlay>
    ) : null;

  const isFeedbackActionLoading = isUpdatingStatus;

  const feedbackModalContent = selectedInterviewId ? (
    <FeedbackOverlay>
      <FeedbackCard>
        <FeedbackTitle>{HR_INTERVIEW_UI_TEXT.INTERVIEW_FEEDBACK}</FeedbackTitle>
        {isFeedbackLoading ? <FeedbackLine>{HR_INTERVIEW_DEFAULT_MESSAGES.LOADING_FEEDBACK}</FeedbackLine> : null}
        {!isFeedbackLoading && feedbackError ? (
          <FeedbackLine>{HR_INTERVIEW_DEFAULT_MESSAGES.NO_FEEDBACK}</FeedbackLine>
        ) : null}
        {!isFeedbackLoading && feedback ? (
          <>
            <FeedbackLine>
              {HR_INTERVIEW_UI_TEXT.RATING}: {feedback.rating}/5
            </FeedbackLine>
            <FeedbackLine>
              {HR_INTERVIEW_UI_TEXT.RECOMMENDATION}: {feedback.recommendation === "HIRED" ? "Hired" : "Rejected"}
            </FeedbackLine>
            <FeedbackLine>
              {HR_INTERVIEW_UI_TEXT.FEEDBACK_STATUS}: {formatFeedbackStatus(selectedFeedbackStatus)}
            </FeedbackLine>
            <FeedbackLine>
              {HR_INTERVIEW_UI_TEXT.COMMENTS}: {feedback.comments || HR_INTERVIEW_DEFAULT_MESSAGES.SUBMITTED_ON_FALLBACK}
            </FeedbackLine>
            {selectedInterview?.applicationStatus ? (
              <FeedbackLine>
                {HR_INTERVIEW_UI_TEXT.APPLICATION_DECISION}:{" "}
                <DecisionTag>
                  {selectedInterview.applicationStatus === "HIRED"
                    ? "Hired"
                    : selectedInterview.applicationStatus === "REJECTED"
                      ? "Rejected"
                      : selectedInterview.applicationStatus}
                </DecisionTag>
              </FeedbackLine>
            ) : null}
            {!canDecideFromFeedback ? (
              <FeedbackLine>{HR_INTERVIEW_UI_TEXT.DECISION_RESTRICTION}</FeedbackLine>
            ) : null}
            <FeedbackLine>
              {HR_INTERVIEW_UI_TEXT.SUBMITTED_ON}:{" "}
              {feedback.submittedAt && !Number.isNaN(new Date(feedback.submittedAt).getTime())
                ? new Date(feedback.submittedAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : HR_INTERVIEW_DEFAULT_MESSAGES.SUBMITTED_ON_FALLBACK}
            </FeedbackLine>
          </>
        ) : null}
        <FeedbackActions>
          <DecisionActions>
            <DecisionButton
              type="button"
              $tone="green"
              disabled={
                isFeedbackActionLoading ||
                isDecisionLocked ||
                !canDecideFromFeedback ||
                selectedFeedbackStatus !== "NEEDS_REVIEW"
              }
              onClick={() => void onUpdateApplicationDecision("HIRED")}
            >
              {HR_INTERVIEW_UI_TEXT.MARK_HIRED}
            </DecisionButton>
            <DecisionButton
              type="button"
              $tone="red"
              disabled={
                isFeedbackActionLoading ||
                isDecisionLocked ||
                !canDecideFromFeedback ||
                selectedFeedbackStatus !== "NEEDS_REVIEW"
              }
              onClick={() => void onUpdateApplicationDecision("REJECTED")}
            >
              {HR_INTERVIEW_UI_TEXT.MARK_REJECTED}
            </DecisionButton>
          </DecisionActions>
          <CloseButton
            type="button"
            disabled={isFeedbackActionLoading}
            onClick={() => setSelectedInterviewId(HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING)}
          >
            {HR_INTERVIEW_UI_TEXT.CLOSE}
          </CloseButton>
        </FeedbackActions>
      </FeedbackCard>
    </FeedbackOverlay>
  ) : null;

  return (
    <ScheduleWrap>
      <StickyHeader>
        <ScheduleTitle>{HR_INTERVIEW_UI_TEXT.TITLE}</ScheduleTitle>
        <ControlsRow>
          <SearchInput
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={HR_INTERVIEW_UI_TEXT.SEARCH_PLACEHOLDER}
          />
          <FilterRow>
            <FilterSelect
              aria-label={HR_INTERVIEW_UI_TEXT.FILTER_INTERVIEW_STATUS_ARIA}
              value={interviewStatusFilter}
              onChange={(event) => setInterviewStatusFilter(event.target.value as HrInterviewStatusFilter)}
            >
              {HR_INTERVIEW_FILTER_OPTIONS.INTERVIEW_STATUS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              aria-label={HR_INTERVIEW_UI_TEXT.FILTER_FEEDBACK_STATUS_ARIA}
              value={feedbackStatusFilter}
              onChange={(event) => setFeedbackStatusFilter(event.target.value as HrFeedbackStatusFilter)}
            >
              {HR_INTERVIEW_FILTER_OPTIONS.FEEDBACK_STATUS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </FilterRow>
        </ControlsRow>
      </StickyHeader>

      <InterviewsTableWrap>
        <InterviewsTable>
          <thead>
            <tr>
              <th>{HR_INTERVIEW_UI_TEXT.CANDIDATE}</th>
              <th>{HR_INTERVIEW_UI_TEXT.JOB_TITLE}</th>
              <th>{HR_INTERVIEW_UI_TEXT.DATE}</th>
              <th>{HR_INTERVIEW_UI_TEXT.TIME}</th>
              <th>{HR_INTERVIEW_UI_TEXT.INTERVIEWER}</th>
              <th>{HR_INTERVIEW_UI_TEXT.MEETING_LINK}</th>
              <th>{HR_INTERVIEW_UI_TEXT.STATUS}</th>
              <th>{HR_INTERVIEW_UI_TEXT.FEEDBACK_STATUS}</th>
              <th>{HR_INTERVIEW_UI_TEXT.ACTIONS}</th>
            </tr>
          </thead>
          <tbody>
            {filteredInterviews.map((interview) => {
              const normalizedStatus = (interview.status ?? "").trim().toUpperCase();
              const canReschedule = normalizedStatus === "SCHEDULED" || normalizedStatus === "CANCELLED";
              const canCancel = normalizedStatus === "SCHEDULED";

              return (
                <tr key={interview._id}>
                  <td>
                    <CandidateCell>
                      <strong>{interview.candidate.name}</strong>
                      <span>{interview.candidate.email}</span>
                    </CandidateCell>
                  </td>
                  <td>{interview.job.title}</td>
                  <td>{interview.interviewDate}</td>
                  <td>{interview.interviewTime}</td>
                  <td>{interview.interviewerName}</td>
                  <td>
                    <a href={interview.meetingLink} target="_blank" rel="noreferrer">
                      {HR_INTERVIEW_UI_TEXT.JOIN_MEET}
                    </a>
                  </td>
                  <td>
                    <StatusBadge $tone={getInterviewTone(interview.status)}>
                      {getInterviewStatusLabel(interview.status)}
                    </StatusBadge>
                  </td>
                  <td>
                    <FeedbackStatusButton
                      type="button"
                      $clickable={canOpenFeedbackModal(interview.feedbackStatus)}
                      onClick={() => {
                        if (!canOpenFeedbackModal(interview.feedbackStatus)) {
                          return;
                        }

                        setSelectedInterviewId(interview._id);
                      }}
                    >
                      {formatFeedbackStatus(interview.feedbackStatus)}
                    </FeedbackStatusButton>
                  </td>
                  <td>
                    {canReschedule || canCancel ? (
                      <MenuContainer>
                        <MenuTrigger
                          type="button"
                          aria-label={HR_INTERVIEW_UI_TEXT.OPEN_INTERVIEW_ACTIONS_ARIA}
                          disabled={isSchedulingInterview || isCancellingInterview}
                          onClick={(event) => {
                            const trigger = event.currentTarget;
                            event.stopPropagation();

                            if (actionMenuAnchor?.interviewId === interview._id) {
                              setActionMenuAnchor(null);
                              return;
                            }

                            openActionMenuForRow(interview._id, trigger);
                          }}
                        >
                          <FiMoreVertical size={15} />
                        </MenuTrigger>
                      </MenuContainer>
                    ) : (
                      HR_INTERVIEW_DEFAULT_MESSAGES.SUBMITTED_ON_FALLBACK
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </InterviewsTable>
      </InterviewsTableWrap>

      {feedbackModalContent && typeof document !== "undefined"
        ? createPortal(feedbackModalContent, document.body)
        : null}
      {scheduleModalContent && typeof document !== "undefined"
        ? createPortal(scheduleModalContent, document.body)
        : null}
      {actionMenuAnchor && selectedInterviewForAction && typeof document !== "undefined"
        ? createPortal(
            <FloatingMenuDropdown
              ref={actionMenuRef}
              style={{ top: `${actionMenuAnchor.top}px`, left: `${actionMenuAnchor.left}px` }}
            >
              {(selectedInterviewForAction.status ?? "").trim().toUpperCase() !== "COMPLETED" ? (
                <MenuOption type="button" onClick={() => openRescheduleModal(selectedInterviewForAction)}>
                  {HR_INTERVIEW_UI_TEXT.RESCHEDULE}
                </MenuOption>
              ) : null}
              {(selectedInterviewForAction.status ?? "").trim().toUpperCase() === "SCHEDULED" ? (
                <MenuOption
                  type="button"
                  $tone="red"
                  disabled={isCancellingInterview}
                  onClick={() => void onCancelInterview(selectedInterviewForAction._id)}
                >
                  {HR_INTERVIEW_UI_TEXT.CANCEL_INTERVIEW}
                </MenuOption>
              ) : null}
            </FloatingMenuDropdown>,
            document.body
          )
        : null}
    </ScheduleWrap>
  );
};
