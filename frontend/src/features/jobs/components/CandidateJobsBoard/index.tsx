import { memo } from 'react';
import { FiBriefcase, FiClock, FiFileText, FiLayers } from 'react-icons/fi';
import { DashboardDescription } from '../../../dashboard/pages/DashboardPage/DashboardPage.styles';
import { EmptyStateCard } from '../../../dashboard/components/EmptyStateCard';
import { Spinner } from '../../../../shared/components/Button/Button.styles';
import { Badge } from '../../../../shared/ui/Badge';
import { Button } from '../../../../shared/ui/Button';
import { Card } from '../../../../shared/ui/Card';
import { useCandidateJobsBoard } from '../../hooks/useCandidateJobsBoard';
import { JOBS_DEFAULT_MESSAGES, JOBS_UI_TEXT } from '../../labels/jobLabels';
import {
  JobDescription,
  JobDescriptionRow,
  JobHeader,
  JobMetaItem,
  JobMetaRow,
  JobTitleWrap,
  Meta,
  PanelWrap,
  Row,
  Title,
} from './CandidateJobsBoard.styles';

const CandidateJobsBoardComponent = () => {
  const { jobs, appliedJobIds, isCandidateJobsLoading, isApplyingJob, jobsEmptyMessage, onApply, formatPostedAt } =
    useCandidateJobsBoard();

  if (isCandidateJobsLoading) {
    return <DashboardDescription>{JOBS_DEFAULT_MESSAGES.LOADING_JOBS}</DashboardDescription>;
  }

  return (
    <PanelWrap>
      {jobs.length === 0 ? <EmptyStateCard title={JOBS_UI_TEXT.NO_JOBS} description={jobsEmptyMessage} /> : null}

      {jobs.map((job) => (
        <Card key={job._id}>
          <JobHeader>
            <JobTitleWrap>
              <Title>{job.title}</Title>
            </JobTitleWrap>
            <Badge $tone={job.isActive ? 'active' : 'inactive'}>
              {job.isActive ? JOBS_UI_TEXT.STATUS_ACTIVE_HIRING : JOBS_UI_TEXT.STATUS_CLOSED}
            </Badge>
          </JobHeader>

          <JobMetaRow>
            <JobMetaItem>
              <FiBriefcase size={14} />
              {job.experienceLevel}
            </JobMetaItem>
            <JobMetaItem>
              <FiLayers size={14} />
              {job.requiredSkills}
            </JobMetaItem>
          </JobMetaRow>

          <JobMetaRow>
            <JobDescriptionRow>
              <FiFileText size={16} />
              <JobDescription>{job.description}</JobDescription>
            </JobDescriptionRow>
          </JobMetaRow>

          <JobMetaRow>
            <JobMetaItem>
              <FiClock size={14} />
              {formatPostedAt(job.createdAt)}
            </JobMetaItem>
            <Meta>
              {JOBS_UI_TEXT.UPDATED} {formatPostedAt(job.updatedAt)}
            </Meta>
          </JobMetaRow>

          <Row>
            <Button
              type="button"
              disabled={isApplyingJob || appliedJobIds.has(job._id)}
              onClick={() => void onApply(job._id)}
            >
              {isApplyingJob ? <Spinner aria-hidden="true" /> : null}
              <span>{appliedJobIds.has(job._id) ? JOBS_UI_TEXT.STATUS_APPLIED : JOBS_UI_TEXT.ACTION_APPLY}</span>
            </Button>
          </Row>
        </Card>
      ))}
    </PanelWrap>
  );
};

export const CandidateJobsBoard = memo(CandidateJobsBoardComponent);
