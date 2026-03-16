import { useGetAppliedJobsQuery } from "../../../jobs/api/jobsApi";
import { CANDIDATE_DEFAULT_MESSAGES } from "../../labels/candidateLabels";
import { formatAppliedDate } from "../../utils/candidateHelpers";
import { DashboardDescription } from "../../../dashboard/pages/DashboardPage/DashboardPage.styles";
import { StatusBadge } from "../../../jobs/components/StatusBadge/StatusBadge";
import { EmptyStateCard } from "../../../dashboard/components/EmptyStateCard/EmptyStateCard";
import { FiFileText } from "react-icons/fi";
import {
  AppliedDescription,
  AppliedJobCard,
  AppliedMeta,
  AppliedTitle,
  AppliedJobsWrap,
  CardStatus,
} from "./AppliedJobsPanel.styles";

export const AppliedJobsPanel = () => {
  const { data, isLoading } = useGetAppliedJobsQuery();

  if (isLoading) {
    return <DashboardDescription>{CANDIDATE_DEFAULT_MESSAGES.LOADING_APPLIED_JOBS}</DashboardDescription>;
  }

  const appliedJobs = data?.data ?? [];

  if (appliedJobs.length === 0) {
    return (
      <EmptyStateCard
        icon={FiFileText}
        title={CANDIDATE_DEFAULT_MESSAGES.EMPTY_APPLIED_JOBS_TITLE}
        description={CANDIDATE_DEFAULT_MESSAGES.EMPTY_APPLIED_JOBS_DESCRIPTION}
      />
    );
  }

  return (
    <AppliedJobsWrap>
      {appliedJobs.map((application) => {
        const job = typeof application.jobId === "string" ? null : application.jobId;
        return (
          <AppliedJobCard key={application._id}>
            <CardStatus>
              <StatusBadge status={application.status} />
            </CardStatus>
            <AppliedTitle>{job?.title || CANDIDATE_DEFAULT_MESSAGES.FALLBACK_JOB_TITLE}</AppliedTitle>
            {job ? <AppliedMeta>{CANDIDATE_DEFAULT_MESSAGES.SKILLS_LABEL}: {job.requiredSkills}</AppliedMeta> : null}
            {job ? <AppliedMeta>{CANDIDATE_DEFAULT_MESSAGES.EXPERIENCE_LABEL}: {job.experienceLevel}</AppliedMeta> : null}
            {job ? <AppliedDescription>{job.description}</AppliedDescription> : null}
            <AppliedMeta>{CANDIDATE_DEFAULT_MESSAGES.APPLIED_ON_LABEL}: {formatAppliedDate(application.createdAt)}</AppliedMeta>
          </AppliedJobCard>
        );
      })}
    </AppliedJobsWrap>
  );
};
