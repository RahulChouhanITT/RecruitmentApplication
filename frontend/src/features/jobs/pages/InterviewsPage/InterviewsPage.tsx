import { EmptyStateCard } from '../../../dashboard/components/EmptyStateCard';
import { DashboardDescription } from '../../../dashboard/pages/DashboardPage/DashboardPage.styles';
import {
  INTERVIEWS_FILTER_LABELS,
  JOBS_DEFAULT_MESSAGES,
  JOBS_UI_TEXT,
} from '../../labels/jobLabels';
import { InterviewCard } from '../../components/InterviewCard';
import { JobsPagination } from '../../components/JobsPagination';
import { useInterviews } from '../../hooks/useInterviews';
import type { InterviewsPageProps } from '../../types/jobTypes';
import { formatJobsDate } from '../../utils/jobHelpers';
import {
  CardsGrid,
  ControlsRow,
  FilterButton,
  FiltersRow,
  PageWrap,
  Section,
  SectionTitle,
  StickyHeader,
} from './InterviewsPage.styles';
import { SearchInput } from '../../../../shared/components/SearchInput';

export const InterviewsPage = ({ initialView = 'both' }: InterviewsPageProps) => {
  const {
    interviews,
    pagination,
    isLoading,
    page,
    setPage,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
  } = useInterviews({ initialView });

  if (isLoading) {
    return <DashboardDescription>{JOBS_DEFAULT_MESSAGES.LOADING_INTERVIEWS}</DashboardDescription>;
  }

  if (interviews.length === 0) {
    return (
      <EmptyStateCard
        title={JOBS_DEFAULT_MESSAGES.NO_INTERVIEWS_TITLE}
        description={JOBS_DEFAULT_MESSAGES.NO_INTERVIEWS_DESCRIPTION}
      />
    );
  }

  return (
    <PageWrap>
      <Section>
        <StickyHeader>
          <SectionTitle>{JOBS_UI_TEXT.MY_INTERVIEWS_TITLE}</SectionTitle>
          <ControlsRow>
            <SearchInput
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={JOBS_UI_TEXT.SEARCH_INTERVIEWS_PLACEHOLDER}
            />
            <FiltersRow>
              <FilterButton
                type="button"
                $active={statusFilter === 'all'}
                onClick={() => setStatusFilter('all')}
              >
                {INTERVIEWS_FILTER_LABELS.all}
              </FilterButton>
              <FilterButton
                type="button"
                $active={statusFilter === 'upcoming'}
                onClick={() => setStatusFilter('upcoming')}
              >
                {INTERVIEWS_FILTER_LABELS.upcoming}
              </FilterButton>
              <FilterButton
                type="button"
                $active={statusFilter === 'completed'}
                onClick={() => setStatusFilter('completed')}
              >
                {INTERVIEWS_FILTER_LABELS.completed}
              </FilterButton>
            </FiltersRow>
          </ControlsRow>
        </StickyHeader>
        {interviews.length === 0 ? (
          <EmptyStateCard
            title={JOBS_DEFAULT_MESSAGES.NO_INTERVIEWS_FOUND_TITLE}
            description={JOBS_DEFAULT_MESSAGES.NO_INTERVIEWS_FOUND_DESCRIPTION}
          />
        ) : null}
        <CardsGrid>
          {interviews.map((interview) => {
            const isCompleted = interview.status === 'COMPLETED';
            return (
              <InterviewCard
                key={interview._id}
                variant={isCompleted ? 'previous' : 'upcoming'}
                title={interview.job.title}
                company={JOBS_DEFAULT_MESSAGES.COMPANY_NAME}
                interviewDate={formatJobsDate(interview.interviewDate)}
                interviewTime={interview.interviewTime}
                personName={interview.interviewerName}
                personLabel="Interviewer"
                meetingLink={isCompleted ? undefined : interview.meetingLink}
                result={interview.result}
                status={interview.status}
              />
            );
          })}
        </CardsGrid>
        <JobsPagination pagination={pagination} page={page} onPageChange={setPage} />
      </Section>
    </PageWrap>
  );
};
