import { useEffect, useMemo, useRef, useState } from "react";
import { useGetAppliedJobsQuery } from "../api/jobsApi";
import type { MyApplicationsStatusFilter } from "../types/jobTypes";

export const useMyApplications = () => {
  const { data: appliedJobsResponse, isLoading } = useGetAppliedJobsQuery();
  const applications = appliedJobsResponse?.data ?? [];
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MyApplicationsStatusFilter>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent): void => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, []);

  const filteredApplications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return applications.filter((application) => {
      if (statusFilter !== "all" && application.status.toLowerCase() !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const job = typeof application.jobId === "string" ? null : application.jobId;
      const searchable = [job?.title, job?.experienceLevel, job?.requiredSkills, job?.description, application.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [applications, searchQuery, statusFilter]);

  return {
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
  };
};
