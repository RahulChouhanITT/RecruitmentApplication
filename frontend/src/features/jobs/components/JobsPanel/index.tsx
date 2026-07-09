import type { JobsPanelProps } from '../../types/jobTypes';
import { EmptyStateCard } from '../../../dashboard/components/EmptyStateCard';
import { JOBS_DEFAULT_MESSAGES } from '../../labels/jobLabels';
import { CandidateJobsBoard } from '../CandidateJobsBoard';
import { HrJobApplicationsPanel } from '../HrJobApplicationsPanel';
import { HrJobsManagementPanel } from '../HrJobsManagementPanel';

export const JobsPanel = ({ role, activePanelId }: JobsPanelProps) => {
  if (role === 'hr') {
    if (activePanelId === 'hr-jobs-applications') {
      return <HrJobApplicationsPanel />;
    }

    return <HrJobsManagementPanel />;
  }

  if (role === 'candidate') {
    return <CandidateJobsBoard />;
  }

  return (
    <EmptyStateCard
      title={JOBS_DEFAULT_MESSAGES.JOBS_UNAVAILABLE_TITLE}
      description={JOBS_DEFAULT_MESSAGES.JOBS_UNAVAILABLE_DESCRIPTION}
    />
  );
};
