import { EmptyStateCard } from "../../../dashboard/components/EmptyStateCard/EmptyStateCard";
import { DashboardDescription } from "../../../dashboard/pages/DashboardPage/DashboardPage.styles";
import { JOBS_DEFAULT_MESSAGES, JOBS_UI_TEXT, MY_APPLICATIONS_FILTER_OPTIONS } from "../../labels/jobLabels";
import { ApplicationCard } from "../../components/ApplicationCard/ApplicationCard";
import { useMyApplications } from "../../hooks/useMyApplications";
import { formatJobsDate, getJobTitleFallback, normalizeApplicationDisplayStatus } from "../../utils/jobHelpers";
import {
  CardsGrid,
  ControlsRow,
  FilterOptionButton,
  FilterOptionList,
  FilterSelectButton,
  FiltersRow,
  PageWrap,
  SectionTitle,
  StickyHeader,
} from "./MyApplicationsPage.styles";
import { SearchInput } from "../../../../shared/components/SearchInput";

export const MyApplicationsPage = () => {
  const {
    applications,
    filteredApplications,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isFilterOpen,
    setIsFilterOpen,
    filterRef,
  } = useMyApplications();

  if (isLoading) {
    return <DashboardDescription>{JOBS_DEFAULT_MESSAGES.LOADING_APPLICATIONS}</DashboardDescription>;
  }

  if (applications.length === 0) {
    return <EmptyStateCard title={JOBS_DEFAULT_MESSAGES.NO_APPLICATIONS_TITLE} description={JOBS_DEFAULT_MESSAGES.NO_APPLICATIONS_DESCRIPTION} />;
  }

  return (
    <PageWrap>
      <StickyHeader>
        <SectionTitle>{JOBS_UI_TEXT.MY_APPLICATIONS_TITLE}</SectionTitle>
        <ControlsRow>
          <SearchInput
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={JOBS_UI_TEXT.SEARCH_APPLICATIONS_PLACEHOLDER}
          />
          <FiltersRow ref={filterRef}>
            <FilterSelectButton
              type="button"
              aria-label="Filter applications by status"
              aria-haspopup="listbox"
              aria-expanded={isFilterOpen}
              onClick={() => setIsFilterOpen((open) => !open)}
            >
              {MY_APPLICATIONS_FILTER_OPTIONS.find((option) => option.value === statusFilter)?.label ?? JOBS_UI_TEXT.APPLICATIONS_ALL_LABEL}
            </FilterSelectButton>
            {isFilterOpen ? (
              <FilterOptionList role="listbox" aria-label="Application status options">
                {MY_APPLICATIONS_FILTER_OPTIONS.map((option) => (
                  <FilterOptionButton
                    key={option.value}
                    type="button"
                    $active={statusFilter === option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setIsFilterOpen(false);
                    }}
                  >
                    {option.label}
                  </FilterOptionButton>
                ))}
              </FilterOptionList>
            ) : null}
          </FiltersRow>
        </ControlsRow>
      </StickyHeader>
      {filteredApplications.length === 0 ? (
        <EmptyStateCard title={JOBS_DEFAULT_MESSAGES.NO_APPLICATIONS_FOUND_TITLE} description={JOBS_DEFAULT_MESSAGES.NO_APPLICATIONS_FOUND_DESCRIPTION} />
      ) : null}
      <CardsGrid>
        {filteredApplications.map((application) => {
          const job = typeof application.jobId === "string" ? null : application.jobId;
          return (
            <ApplicationCard
              key={application._id}
              title={getJobTitleFallback(job?.title)}
              experience={job?.experienceLevel ?? "-"}
              requiredSkills={job?.requiredSkills ?? "-"}
              description={job?.description ?? "-"}
              status={normalizeApplicationDisplayStatus(application.status)}
              appliedDate={formatJobsDate(application.createdAt)}
            />
          );
        })}
      </CardsGrid>
    </PageWrap>
  );
};
