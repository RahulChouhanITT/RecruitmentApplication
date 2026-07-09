import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useGetAppliedJobsQuery } from '../api/jobsApi';
import type { MyApplicationsStatusFilter } from '../types/jobTypes';

export const useMyApplications = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MyApplicationsStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const { data: appliedJobsResponse, isLoading } = useGetAppliedJobsQuery({
    page,
    limit: 10,
    search: deferredSearchQuery.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const applications = useMemo(() => appliedJobsResponse?.data ?? [], [appliedJobsResponse?.data]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent): void => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [deferredSearchQuery, statusFilter]);

  return {
    applications,
    pagination: appliedJobsResponse?.pagination,
    isLoading,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isFilterOpen,
    setIsFilterOpen,
    filterRef,
  };
};
