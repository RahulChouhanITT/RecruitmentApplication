import { useMemo, useState } from "react";
import { showToast, TOAST_TYPES } from "../../../../utils/toast";
import { EmptyStateCard } from "../../../dashboard/components/EmptyStateCard/EmptyStateCard";
import { DashboardDescription } from "../../../dashboard/pages/DashboardPage/DashboardPage.styles";
import { useGetInterviewerInterviewsQuery, useSubmitInterviewFeedbackMutation } from "../../../jobs/api/jobsApi";
import { InterviewCard } from "../../../jobs/components/InterviewCard/InterviewCard";
import { INTERVIEWER_INITIAL_VALUES, INTERVIEWER_STATUS_VALUES } from "../../constants/interviewerConstants";
import { INTERVIEWER_DEFAULT_MESSAGES, INTERVIEWER_UI_TEXT } from "../../labels/interviewerLabels";
import {
  CardsGrid,
  ControlsRow,
  FilterButton,
  FiltersRow,
  PageWrap,
  Section,
  SectionTitle,
  StickyHeader,
} from "../../../jobs/pages/InterviewsPage/InterviewsPage.styles";
import { SearchInput } from "../../../../shared/components/SearchInput";
import { InterviewFeedbackModal } from "../../components/InterviewFeedbackModal/InterviewFeedbackModal";

const toDateTime = (date: string, time: string): Date => new Date(`${date}T${time}:00+05:30`);

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

type InterviewerInterviewsPageProps = {
  initialView?: "upcoming" | "previous" | "both";
};

export const InterviewerInterviewsPage = ({ initialView = "both" }: InterviewerInterviewsPageProps) => {
  const { data: interviewsResponse, isLoading } = useGetInterviewerInterviewsQuery();
  const [submitFeedback, { isLoading: isSubmittingFeedback }] = useSubmitInterviewFeedbackMutation();
  const [selectedInterviewId, setSelectedInterviewId] = useState<string>(INTERVIEWER_INITIAL_VALUES.EMPTY_STRING);
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "completed">(
    initialView === "upcoming"
      ? INTERVIEWER_STATUS_VALUES.UPCOMING
      : initialView === "previous"
        ? INTERVIEWER_STATUS_VALUES.COMPLETED_FILTER
        : INTERVIEWER_STATUS_VALUES.ALL
  );
  const [searchQuery, setSearchQuery] = useState(INTERVIEWER_INITIAL_VALUES.EMPTY_STRING);
  const interviews = interviewsResponse?.data ?? [];
  const sortedInterviews = useMemo(
    () =>
      [...interviews].sort(
        (a, b) =>
          toDateTime(b.interviewDate, b.interviewTime).getTime() - toDateTime(a.interviewDate, a.interviewTime).getTime()
      ),
    [interviews]
  );
  const filteredInterviews = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return sortedInterviews.filter((interview) => {
      const matchesStatus =
        statusFilter === INTERVIEWER_STATUS_VALUES.ALL ||
        (statusFilter === INTERVIEWER_STATUS_VALUES.UPCOMING && interview.status !== INTERVIEWER_STATUS_VALUES.COMPLETED) ||
        (statusFilter === INTERVIEWER_STATUS_VALUES.COMPLETED_FILTER && interview.status === INTERVIEWER_STATUS_VALUES.COMPLETED);

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (interview.job?.title ?? "").toLowerCase().includes(normalizedQuery);
    });
  }, [searchQuery, sortedInterviews, statusFilter]);

  if (isLoading) {
    return <DashboardDescription>{INTERVIEWER_DEFAULT_MESSAGES.LOADING_INTERVIEWS}</DashboardDescription>;
  }

  if (interviews.length === 0) {
    return (
      <EmptyStateCard
        title={INTERVIEWER_DEFAULT_MESSAGES.NO_INTERVIEWS_TITLE}
        description={INTERVIEWER_DEFAULT_MESSAGES.NO_INTERVIEWS_DESCRIPTION}
      />
    );
  }

  const onSubmitFeedback = async (payload: {
    rating: number;
    comments?: string;
    recommendation: "HIRED" | "REJECTED";
  }): Promise<void> => {
    if (!selectedInterviewId) {
      return;
    }

    try {
      await submitFeedback({ interviewId: selectedInterviewId, ...payload }).unwrap();
      showToast({ type: TOAST_TYPES.SUCCESS, message: INTERVIEWER_DEFAULT_MESSAGES.FEEDBACK_SUBMITTED_SUCCESS });
      setSelectedInterviewId(INTERVIEWER_INITIAL_VALUES.EMPTY_STRING);
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : INTERVIEWER_DEFAULT_MESSAGES.FEEDBACK_SUBMIT_FAILED;
      showToast({ type: TOAST_TYPES.ERROR, message });
    }
  };

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
        {filteredInterviews.length === 0 ? (
          <EmptyStateCard
            title={INTERVIEWER_DEFAULT_MESSAGES.NO_INTERVIEWS_FOUND_TITLE}
            description={INTERVIEWER_DEFAULT_MESSAGES.NO_INTERVIEWS_FOUND_DESCRIPTION}
          />
        ) : (
          <CardsGrid>
            {filteredInterviews.map((interview) => {
              const isCompleted = interview.status === INTERVIEWER_STATUS_VALUES.COMPLETED;
              return (
                <InterviewCard
                  key={interview._id}
                  variant={isCompleted ? "previous" : "upcoming"}
                  title={interview.job?.title || INTERVIEWER_DEFAULT_MESSAGES.UNTITLED_JOB}
                  company={INTERVIEWER_UI_TEXT.COMPANY_NAME}
                  interviewDate={formatDate(interview.interviewDate)}
                  interviewTime={interview.interviewTime}
                  personName={interview.candidate?.name || "-"}
                  personLabel={INTERVIEWER_UI_TEXT.CANDIDATE_LABEL}
                  meetingLink={isCompleted ? undefined : interview.meetingLink}
                  actionLabel={!isCompleted ? INTERVIEWER_UI_TEXT.SUBMIT_FEEDBACK : undefined}
                  onActionClick={!isCompleted ? () => setSelectedInterviewId(interview._id) : undefined}
                  result={interview.result}
                  status={interview.status}
                />
              );
            })}
          </CardsGrid>
        )}
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
