import { createPortal } from 'react-dom';
import { FiMoreVertical } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { SearchInput } from '../../../../shared/components/SearchInput';
import { Select } from '../../../../shared/ui/Select';
import { DashboardDescription } from '../../../dashboard/pages/DashboardPage/DashboardPage.styles';
import { EmptyStateCard } from '../../../dashboard/components/EmptyStateCard';
import { HR_INTERVIEW_INITIAL_VALUES } from '../../constants/hrConstants';
import {
  HR_INTERVIEW_DEFAULT_MESSAGES,
  HR_INTERVIEW_FILTER_OPTIONS,
  HR_INTERVIEW_UI_TEXT,
} from '../../labels/hrLabels';
import type {
  HrFeedbackStatusFilter,
  HrInterviewStatusFilter,
} from '../../types/hrTypes';
import {
  canOpenFeedbackModal,
  formatFeedbackStatus,
  getInterviewStatusLabel,
  getInterviewTone,
} from '../../utils/hrInterviewHelpers';
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
  ScheduleTextarea,
  ScheduleTimeLayout,
  ScheduleTitle,
  ScheduleWrap,
  StatusBadge,
  StickyHeader,
  DurationButton,
  DurationGroup,
} from './InterviewSchedulePanel.styles';
import { Spinner } from '../../../../shared/components/Button/Button.styles';
import { JobsPagination } from '../../../jobs/components/JobsPagination';
import { useInterviewSchedulePanel } from '../../hooks/useInterviewSchedulePanel';

export const InterviewSchedulePanel = () => {
  const {
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
  } = useInterviewSchedulePanel();

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
            <ScheduleField style={{ gridColumn: '1 / -1' }}>
              <ScheduleLabel>{HR_INTERVIEW_UI_TEXT.SCHEDULE_DATE_TIME}</ScheduleLabel>
              <ScheduleSection>
                <ScheduleTimeLayout>
                  <DatePicker
                    selected={scheduleFormValues.selectedDateTime}
                    onChange={(value: Date | null) => {
                      const nextValue =
                        value instanceof Date && !Number.isNaN(value.getTime()) ? value : null;
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
              <ScheduleError>{scheduleFormErrors.selectedDateTime ?? '\u00A0'}</ScheduleError>
            </ScheduleField>

            <ScheduleField style={{ gridColumn: '1 / -1' }}>
              <ScheduleLabel>{HR_INTERVIEW_UI_TEXT.AVAILABLE_INTERVIEWERS}</ScheduleLabel>
              <ScheduleSection>
                <Select
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
                </Select>
                {isInterviewersLoading ? (
                  <DashboardDescription>
                    {HR_INTERVIEW_DEFAULT_MESSAGES.LOADING}
                  </DashboardDescription>
                ) : null}
                <JobsPagination
                  pagination={interviewerPagination}
                  page={interviewerPage}
                  onPageChange={setInterviewerPage}
                />
              </ScheduleSection>
              <ScheduleError>{scheduleFormErrors.interviewerId ?? '\u00A0'}</ScheduleError>
            </ScheduleField>

            <ScheduleField style={{ gridColumn: '1 / -1' }}>
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
              <ScheduleError>{'\u00A0'}</ScheduleError>
            </ScheduleField>
          </ScheduleFormGrid>

          <ScheduleActions>
            <CloseButton
              type="button"
              onClick={closeScheduleModal}
              disabled={isSchedulingInterview}
            >
              {isSchedulingInterview
                ? HR_INTERVIEW_UI_TEXT.SCHEDULING
                : HR_INTERVIEW_UI_TEXT.CANCEL}
            </CloseButton>
            <PrimaryButton
              type="button"
              onClick={() => void onSubmitReschedule()}
              disabled={isSchedulingInterview}
            >
              {isSchedulingInterview ? <Spinner aria-hidden="true" /> : null}
              <span>
                {isSchedulingInterview
                  ? HR_INTERVIEW_UI_TEXT.SCHEDULING
                  : HR_INTERVIEW_UI_TEXT.RESCHEDULE_ACTION}
              </span>
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
        {isFeedbackLoading ? (
          <FeedbackLine>{HR_INTERVIEW_DEFAULT_MESSAGES.LOADING_FEEDBACK}</FeedbackLine>
        ) : null}
        {!isFeedbackLoading && feedbackError ? (
          <FeedbackLine>{HR_INTERVIEW_DEFAULT_MESSAGES.NO_FEEDBACK}</FeedbackLine>
        ) : null}
        {!isFeedbackLoading && feedback ? (
          <>
            <FeedbackLine>
              {HR_INTERVIEW_UI_TEXT.RATING}: {feedback.rating}/5
            </FeedbackLine>
            <FeedbackLine>
              {HR_INTERVIEW_UI_TEXT.RECOMMENDATION}:{' '}
              {feedback.recommendation === 'HIRED' ? 'Hired' : 'Rejected'}
            </FeedbackLine>
            <FeedbackLine>
              {HR_INTERVIEW_UI_TEXT.FEEDBACK_STATUS}: {formatFeedbackStatus(selectedFeedbackStatus)}
            </FeedbackLine>
            <FeedbackLine>
              {HR_INTERVIEW_UI_TEXT.COMMENTS}:{' '}
              {feedback.comments || HR_INTERVIEW_DEFAULT_MESSAGES.SUBMITTED_ON_FALLBACK}
            </FeedbackLine>
            {selectedInterview?.applicationStatus ? (
              <FeedbackLine>
                {HR_INTERVIEW_UI_TEXT.APPLICATION_DECISION}:{' '}
                <DecisionTag>
                  {selectedInterview.applicationStatus === 'HIRED'
                    ? 'Hired'
                    : selectedInterview.applicationStatus === 'REJECTED'
                      ? 'Rejected'
                      : selectedInterview.applicationStatus}
                </DecisionTag>
              </FeedbackLine>
            ) : null}
            {!canDecideFromFeedback ? (
              <FeedbackLine>{HR_INTERVIEW_UI_TEXT.DECISION_RESTRICTION}</FeedbackLine>
            ) : null}
            <FeedbackLine>
              {HR_INTERVIEW_UI_TEXT.SUBMITTED_ON}:{' '}
              {feedback.submittedAt && !Number.isNaN(new Date(feedback.submittedAt).getTime())
                ? new Date(feedback.submittedAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
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
                selectedFeedbackStatus !== 'NEEDS_REVIEW'
              }
              onClick={() => void onUpdateApplicationDecision('HIRED')}
            >
              {isFeedbackActionLoading ? <Spinner aria-hidden="true" /> : null}
              <span>{HR_INTERVIEW_UI_TEXT.MARK_HIRED}</span>
            </DecisionButton>
            <DecisionButton
              type="button"
              $tone="red"
              disabled={
                isFeedbackActionLoading ||
                isDecisionLocked ||
                !canDecideFromFeedback ||
                selectedFeedbackStatus !== 'NEEDS_REVIEW'
              }
              onClick={() => void onUpdateApplicationDecision('REJECTED')}
            >
              {isFeedbackActionLoading ? <Spinner aria-hidden="true" /> : null}
              <span>{HR_INTERVIEW_UI_TEXT.MARK_REJECTED}</span>
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
            <Select
              $pill
              aria-label={HR_INTERVIEW_UI_TEXT.FILTER_INTERVIEW_STATUS_ARIA}
              value={interviewStatusFilter}
              onChange={(event) =>
                setInterviewStatusFilter(event.target.value as HrInterviewStatusFilter)
              }
            >
              {HR_INTERVIEW_FILTER_OPTIONS.INTERVIEW_STATUS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              $pill
              aria-label={HR_INTERVIEW_UI_TEXT.FILTER_FEEDBACK_STATUS_ARIA}
              value={feedbackStatusFilter}
              onChange={(event) =>
                setFeedbackStatusFilter(event.target.value as HrFeedbackStatusFilter)
              }
            >
              {HR_INTERVIEW_FILTER_OPTIONS.FEEDBACK_STATUS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
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
            {interviews.map((interview) => {
              const normalizedStatus = (interview.status ?? '').trim().toUpperCase();
              const canReschedule =
                normalizedStatus === 'SCHEDULED' || normalizedStatus === 'CANCELLED';
              const canCancel = normalizedStatus === 'SCHEDULED';

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
      <JobsPagination
        pagination={interviewsPagination}
        page={interviewsPage}
        onPageChange={setInterviewsPage}
      />

      {feedbackModalContent && typeof document !== 'undefined'
        ? createPortal(feedbackModalContent, document.body)
        : null}
      {scheduleModalContent && typeof document !== 'undefined'
        ? createPortal(scheduleModalContent, document.body)
        : null}
      {actionMenuAnchor && selectedInterviewForAction && typeof document !== 'undefined'
        ? createPortal(
            <FloatingMenuDropdown
              ref={actionMenuRef}
              style={{ top: `${actionMenuAnchor.top}px`, left: `${actionMenuAnchor.left}px` }}
            >
              {(selectedInterviewForAction.status ?? '').trim().toUpperCase() !== 'COMPLETED' ? (
                <MenuOption
                  type="button"
                  onClick={() => openRescheduleModal(selectedInterviewForAction)}
                >
                  {HR_INTERVIEW_UI_TEXT.RESCHEDULE}
                </MenuOption>
              ) : null}
              {(selectedInterviewForAction.status ?? '').trim().toUpperCase() === 'SCHEDULED' ? (
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
            document.body,
          )
        : null}
    </ScheduleWrap>
  );
};
