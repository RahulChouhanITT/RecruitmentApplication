import { EmptyStateCard } from '../../../dashboard/components/EmptyStateCard';
import { DashboardDescription } from '../../../dashboard/pages/DashboardPage/DashboardPage.styles';
import { InterviewCard } from '../../../jobs/components/InterviewCard';
import {
  INTERVIEWER_INITIAL_VALUES,
  INTERVIEWER_STATUS_VALUES,
} from '../../constants/interviewerConstants';
import { INTERVIEWER_DEFAULT_MESSAGES, INTERVIEWER_UI_TEXT } from '../../labels/interviewerLabels';
import { useInterviewerInterviewsPage } from '../../hooks/useInterviewerInterviewsPage';
import {
  CardsGrid,
  ControlsRow,
  FilterButton,
  FiltersRow,
  PageWrap,
  Section,
  SectionTitle,
  StickyHeader,
} from '../../../jobs/pages/InterviewsPage/InterviewsPage.styles';
import { SearchInput } from '../../../../shared/components/SearchInput';
import { InterviewFeedbackModal } from '../../components/InterviewFeeadbackModal';
import { JobsPagination } from '../../../jobs/components/JobsPagination';
import type { ApiQueryError } from '../../../../types/apiTypes';

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

type InterviewerInterviewsPageProps = {
  initialView?: 'upcoming' | 'previous' | 'both';
};

export const InterviewerInterviewsPage = ({
  initialView = 'both',
}: InterviewerInterviewsPageProps) => {
  const {
    isLoading,
    isError,
    error,
    interviews,
    pagination,
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
  } = useInterviewerInterviewsPage({ initialView });

  if (isLoading) {
    return (
      <DashboardDescription>{INTERVIEWER_DEFAULT_MESSAGES.LOADING_INTERVIEWS}</DashboardDescription>
    );
  }

  if (isError) {
    return (
      <EmptyStateCard
        title={INTERVIEWER_DEFAULT_MESSAGES.NO_INTERVIEWS_TITLE}
        description={
          (error as ApiQueryError | undefined)?.message ||
          INTERVIEWER_DEFAULT_MESSAGES.FETCH_INTERVIEWS_FAILED
        }
      />
    );
  }

  if (interviews.length === 0) {
    return (
      <EmptyStateCard
        title={INTERVIEWER_DEFAULT_MESSAGES.NO_INTERVIEWS_TITLE}
        description={INTERVIEWER_DEFAULT_MESSAGES.NO_INTERVIEWS_DESCRIPTION}
      />
    );
  }

  return (
    <PageWrap>
      <Section>
        <StickyHeader>
          <SectionTitle>{INTERVIEWER_UI_TEXT.TITLE}</SectionTitle>
          <ControlsRow>
            <SearchInput
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={INTERVIEWER_UI_TEXT.SEARCH_PLACEHOLDER}
            />
            <FiltersRow>
              <FilterButton
                type="button"
                $active={statusFilter === INTERVIEWER_STATUS_VALUES.ALL}
                onClick={() => setStatusFilter(INTERVIEWER_STATUS_VALUES.ALL)}
              >
                {INTERVIEWER_UI_TEXT.FILTER_ALL}
              </FilterButton>
              <FilterButton
                type="button"
                $active={statusFilter === INTERVIEWER_STATUS_VALUES.UPCOMING}
                onClick={() => setStatusFilter(INTERVIEWER_STATUS_VALUES.UPCOMING)}
              >
                {INTERVIEWER_UI_TEXT.FILTER_UPCOMING}
              </FilterButton>
              <FilterButton
                type="button"
                $active={statusFilter === INTERVIEWER_STATUS_VALUES.COMPLETED_FILTER}
                onClick={() => setStatusFilter(INTERVIEWER_STATUS_VALUES.COMPLETED_FILTER)}
              >
                {INTERVIEWER_UI_TEXT.FILTER_COMPLETED}
              </FilterButton>
            </FiltersRow>
          </ControlsRow>
        </StickyHeader>
        {interviews.length === 0 ? (
          <EmptyStateCard
            title={INTERVIEWER_DEFAULT_MESSAGES.NO_INTERVIEWS_FOUND_TITLE}
            description={INTERVIEWER_DEFAULT_MESSAGES.NO_INTERVIEWS_FOUND_DESCRIPTION}
          />
        ) : (
          <CardsGrid>
            {interviews.map((interview) => {
              const normalizedStatus = (interview.status ?? '').trim().toUpperCase();
              const isCompleted = normalizedStatus === INTERVIEWER_STATUS_VALUES.COMPLETED;
              const isCancelled = normalizedStatus === 'CANCELLED';
              const canSubmitFeedback = normalizedStatus === 'SCHEDULED';
              return (
                <InterviewCard
                  key={interview._id}
                  variant={isCompleted || isCancelled ? 'previous' : 'upcoming'}
                  title={interview.job?.title || INTERVIEWER_DEFAULT_MESSAGES.UNTITLED_JOB}
                  company={INTERVIEWER_UI_TEXT.COMPANY_NAME}
                  interviewDate={formatDate(interview.interviewDate)}
                  interviewTime={interview.interviewTime}
                  personName={interview.candidate?.name || '-'}
                  personLabel={INTERVIEWER_UI_TEXT.CANDIDATE_LABEL}
                  meetingLink={isCompleted || isCancelled ? undefined : interview.meetingLink}
                  actionLabel={canSubmitFeedback ? INTERVIEWER_UI_TEXT.SUBMIT_FEEDBACK : undefined}
                  onActionClick={
                    canSubmitFeedback ? () => setSelectedInterviewId(interview._id) : undefined
                  }
                  result={interview.result}
                  status={interview.status}
                />
              );
            })}
          </CardsGrid>
        )}
        <JobsPagination pagination={pagination} page={page} onPageChange={setPage} />
      </Section>

      <InterviewFeedbackModal
        isOpen={Boolean(selectedInterviewId)}
        onClose={() => setSelectedInterviewId(INTERVIEWER_INITIAL_VALUES.EMPTY_STRING)}
        onSubmit={onSubmitFeedback}
        isSubmitting={isSubmittingFeedback}
      />
    </PageWrap>
  );
};
