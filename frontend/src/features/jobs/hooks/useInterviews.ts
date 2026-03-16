import { useMemo, useState } from "react";
import { useGetCandidateInterviewsQuery } from "../api/jobsApi";
import { toInterviewDateTime } from "../utils/jobHelpers";
import type { InterviewsPageProps, InterviewsViewFilter } from "../types/jobTypes";

export const useInterviews = ({ initialView = "both" }: InterviewsPageProps) => {
  const { data: interviewsResponse, isLoading } = useGetCandidateInterviewsQuery();
  const interviews = interviewsResponse?.data ?? [];
  const [statusFilter, setStatusFilter] = useState<InterviewsViewFilter>(
    initialView === "upcoming" ? "upcoming" : initialView === "previous" ? "completed" : "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const sortedInterviews = useMemo(
    () =>
      [...interviews].sort(
        (a, b) =>
          toInterviewDateTime(b.interviewDate, b.interviewTime).getTime() - toInterviewDateTime(a.interviewDate, a.interviewTime).getTime()
      ),
    [interviews]
  );

  const filteredInterviews = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return sortedInterviews.filter((interview) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "upcoming" && interview.status !== "COMPLETED") ||
        (statusFilter === "completed" && interview.status === "COMPLETED");

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (interview.job.title ?? "").toLowerCase().includes(normalizedQuery);
    });
  }, [searchQuery, sortedInterviews, statusFilter]);

  return {
    interviews,
    filteredInterviews,
    isLoading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
  };
};
