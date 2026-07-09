import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useGetCandidateInterviewsQuery } from '../api/jobsApi';
import type { InterviewsPageProps, InterviewsViewFilter } from '../types/jobTypes';

export const useInterviews = ({ initialView = 'both' }: InterviewsPageProps) => {
  const [statusFilter, setStatusFilter] = useState<InterviewsViewFilter>(
    initialView === 'upcoming' ? 'upcoming' : initialView === 'previous' ? 'completed' : 'all',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const { data: interviewsResponse, isLoading } = useGetCandidateInterviewsQuery({
    page,
    limit: 10,
    search: deferredSearchQuery.trim() || undefined,
    view: statusFilter,
  });
  const interviews = useMemo(() => interviewsResponse?.data ?? [], [interviewsResponse?.data]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearchQuery, statusFilter]);

  return {
    interviews,
    pagination: interviewsResponse?.pagination,
    isLoading,
    page,
    setPage,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
  };
};
