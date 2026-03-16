import { useMemo, useState } from "react";
import { useApplyForJobMutation, useGetAppliedJobsQuery, useGetCandidateJobsQuery } from "../api/jobsApi";
import { JOBS_DEFAULT_MESSAGES } from "../labels/jobLabels";
import { getAppliedJobId, getJobErrorMessage } from "../utils/jobHelpers";
import { showToast, TOAST_TYPES } from "../../../utils/toast";
import type { JobsStatusFilter } from "../types/jobTypes";

export const useOpenJobs = () => {
  const { data: jobsResponse, isLoading: isJobsLoading } = useGetCandidateJobsQuery();
  const { data: appliedJobsResponse } = useGetAppliedJobsQuery();
  const [applyForJob, { isLoading: isApplying }] = useApplyForJobMutation();
  const [statusFilter, setStatusFilter] = useState<JobsStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const jobs = useMemo(() => jobsResponse?.data ?? [], [jobsResponse?.data]);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" && job.isActive) || (statusFilter === "closed" && !job.isActive);

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchable = [job.title, job.experienceLevel, job.requiredSkills].join(" ").toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [jobs, searchQuery, statusFilter]);

  const appliedJobIds = useMemo(
    () =>
      new Set(
        (appliedJobsResponse?.data ?? [])
          .map((application) => getAppliedJobId(application.jobId))
          .filter(Boolean) as string[]
      ),
    [appliedJobsResponse?.data]
  );

  const onApply = async (jobId: string): Promise<void> => {
    try {
      await applyForJob({ jobId }).unwrap();
      showToast({ type: TOAST_TYPES.SUCCESS, message: JOBS_DEFAULT_MESSAGES.APPLY_SUCCESS });
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getJobErrorMessage(error, JOBS_DEFAULT_MESSAGES.APPLY_FAILED),
      });
    }
  };

  return {
    jobs,
    filteredJobs,
    appliedJobIds,
    isJobsLoading,
    isApplying,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    onApply,
  };
};
