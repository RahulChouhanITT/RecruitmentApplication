import { EmptyStateCard } from '../../../dashboard/components/EmptyStateCard';
import { DashboardDescription } from '../../../dashboard/pages/DashboardPage/DashboardPage.styles';
import { JOBS_DEFAULT_MESSAGES, JOBS_FILTER_LABELS, JOBS_UI_TEXT } from '../../labels/jobLabels';
import { JobCard } from '../../components/JobCard';
import { JobsPagination } from '../../components/JobsPagination';
import { useOpenJobs } from '../../hooks/useOpenJobs';
import {
  CardsGrid,
  ControlsRow,
  FilterButton,
  FiltersRow,
  PageWrap,
  SectionTitle,
  StickyHeader,
} from './OpenJobsPage.styles';
import { SearchInput } from '../../../../shared/components/SearchInput';

export const OpenJobsPage = () => {
  const {
    jobs,
    pagination,
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
  } = useOpenJobs();

  if (isJobsLoading) {
    return <DashboardDescription>{JOBS_DEFAULT_MESSAGES.LOADING_JOBS}</DashboardDescription>;
  }

  if (jobs.length === 0) {
    return (
      <EmptyStateCard
        title={JOBS_DEFAULT_MESSAGES.NO_OPEN_JOBS_TITLE}
        description={JOBS_DEFAULT_MESSAGES.NO_OPEN_JOBS_DESCRIPTION}
      />
    );
  }

  return (
    <PageWrap>
      <StickyHeader>
        <SectionTitle>{JOBS_UI_TEXT.OPEN_JOBS_TITLE}</SectionTitle>
        <ControlsRow>
          <SearchInput
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={JOBS_UI_TEXT.SEARCH_JOBS_PLACEHOLDER}
          />
          <FiltersRow>
            <FilterButton
              type="button"
              $active={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
            >
              {JOBS_FILTER_LABELS.all}
            </FilterButton>
            <FilterButton
              type="button"
              $active={statusFilter === 'active'}
              onClick={() => setStatusFilter('active')}
            >
              {JOBS_FILTER_LABELS.active}
            </FilterButton>
            <FilterButton
              type="button"
              $active={statusFilter === 'closed'}
              onClick={() => setStatusFilter('closed')}
            >
              {JOBS_FILTER_LABELS.closed}
            </FilterButton>
          </FiltersRow>
        </ControlsRow>
      </StickyHeader>
      {jobs.length === 0 ? (
        <EmptyStateCard
          title={JOBS_DEFAULT_MESSAGES.NO_JOBS_FOUND_TITLE}
          description={JOBS_DEFAULT_MESSAGES.NO_JOBS_FOUND_DESCRIPTION}
        />
      ) : null}
      <CardsGrid>
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            title={job.title}
            experience={job.experienceLevel}
            requiredSkills={job.requiredSkills}
            description={job.description}
            isActive={job.isActive}
            isApplied={appliedJobIds.has(job._id)}
            isApplying={isApplying}
            onApply={() => void onApply(job._id)}
          />
        ))}
      </CardsGrid>
      <JobsPagination pagination={pagination} page={page} onPageChange={setPage} />
    </PageWrap>
  );
};
