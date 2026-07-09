import { createPortal } from 'react-dom';
import { memo } from 'react';
import { FiBriefcase, FiClock, FiFileText, FiLayers, FiPlus } from 'react-icons/fi';
import { DashboardDescription } from '../../../dashboard/pages/DashboardPage/DashboardPage.styles';
import { EmptyStateCard } from '../../../dashboard/components/EmptyStateCard';
import { SearchInput } from '../../../../shared/components/SearchInput';
import { Badge } from '../../../../shared/ui/Badge';
import { Button } from '../../../../shared/ui/Button';
import { Card } from '../../../../shared/ui/Card';
import { useHrManageJobs } from '../../hooks/useHrManageJobs';
import { JOBS_DEFAULT_MESSAGES, JOBS_PANEL_TEXT, JOBS_UI_TEXT } from '../../labels/jobLabels';
import { JobsPagination } from '../JobsPagination';
import { CreateJobModal } from '../modals/CreateJobModal';
import {
  ConfirmMessage,
  ControlsBar,
  FilterBar,
  FilterButton,
  FloatingAddButton,
  JobDescription,
  JobDescriptionRow,
  JobHeader,
  JobMetaItem,
  JobMetaRow,
  JobTitleWrap,
  Meta,
  ModalActions,
  ModalCard,
  ModalOverlay,
  ModalTitle,
  PanelWrap,
  Row,
  SectionTitle,
  StickySectionHeader,
  Title,
} from './HrJobsManagementPanel.styles';

const HrJobsManagementPanelComponent = () => {
  const {
    allJobsFilter,
    setAllJobsFilter,
    manageSearchQuery,
    setManageSearchQuery,
    isCreateJobModalOpen,
    editingJob,
    pendingJobStatusAction,
    setPendingJobStatusAction,
    jobs,
    pagination,
    jobsEmptyMessage,
    isHrJobsLoading,
    isClosingJob,
    isActivatingJob,
    page,
    setPage,
    onOpenCreateModal,
    onCloseCreateModal,
    onEditJob,
    confirmPendingJobStatusAction,
    formatPostedAt,
  } = useHrManageJobs();

  if (isHrJobsLoading) {
    return <DashboardDescription>{JOBS_DEFAULT_MESSAGES.LOADING_JOBS}</DashboardDescription>;
  }

  return (
    <PanelWrap>
      <FloatingAddButton type="button" onClick={onOpenCreateModal} aria-label={JOBS_UI_TEXT.CREATE_JOB_ARIA}>
        <FiPlus size={20} />
      </FloatingAddButton>

      <StickySectionHeader>
        <SectionTitle>{JOBS_UI_TEXT.MANAGE_JOBS_TITLE}</SectionTitle>
        <ControlsBar>
          <SearchInput
            value={manageSearchQuery}
            onChange={(event) => setManageSearchQuery(event.target.value)}
            placeholder={JOBS_UI_TEXT.SEARCH_MANAGE_PLACEHOLDER}
          />
          <FilterBar>
            <FilterButton type="button" $active={allJobsFilter === 'all'} onClick={() => setAllJobsFilter('all')}>
              {JOBS_UI_TEXT.ALL_JOBS}
            </FilterButton>
            <FilterButton
              type="button"
              $active={allJobsFilter === 'active'}
              onClick={() => setAllJobsFilter('active')}
            >
              {JOBS_UI_TEXT.ACTIVE_STATUS}
            </FilterButton>
            <FilterButton
              type="button"
              $active={allJobsFilter === 'closed'}
              onClick={() => setAllJobsFilter('closed')}
            >
              {JOBS_UI_TEXT.CLOSED_STATUS}
            </FilterButton>
          </FilterBar>
        </ControlsBar>
      </StickySectionHeader>

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
            <Button type="button" onClick={() => onEditJob(job)}>
              {JOBS_UI_TEXT.EDIT}
            </Button>
            {job.isActive ? (
              <Button
                type="button"
                $variant="ghost"
                disabled={isClosingJob}
                onClick={() => setPendingJobStatusAction({ jobId: job._id, action: 'Close' })}
              >
                {JOBS_UI_TEXT.CLOSE}
              </Button>
            ) : (
              <Button
                type="button"
                $variant="ghost"
                disabled={isActivatingJob}
                onClick={() => setPendingJobStatusAction({ jobId: job._id, action: 'Activate' })}
              >
                {JOBS_UI_TEXT.ACTIVATE}
              </Button>
            )}
          </Row>
        </Card>
      ))}

      <JobsPagination pagination={pagination} page={page} onPageChange={setPage} />

      {isCreateJobModalOpen && typeof document !== 'undefined'
        ? createPortal(<CreateJobModal isOpen job={editingJob} onClose={onCloseCreateModal} />, document.body)
        : null}

      {pendingJobStatusAction && typeof document !== 'undefined'
        ? createPortal(
            <ModalOverlay>
              <ModalCard>
                <ModalTitle>{JOBS_UI_TEXT.CONFIRM_JOB_STATUS}</ModalTitle>
                <ConfirmMessage>
                  {JOBS_PANEL_TEXT.JOB_STATUS_CONFIRMATION(pendingJobStatusAction.action)}
                </ConfirmMessage>
                <ModalActions>
                  <Button
                    type="button"
                    $variant="ghost"
                    onClick={() => setPendingJobStatusAction(null)}
                    disabled={isClosingJob || isActivatingJob}
                  >
                    {JOBS_UI_TEXT.CANCEL}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void confirmPendingJobStatusAction()}
                    disabled={isClosingJob || isActivatingJob}
                  >
                    {JOBS_UI_TEXT.CONFIRM}
                  </Button>
                </ModalActions>
              </ModalCard>
            </ModalOverlay>,
            document.body,
          )
        : null}
    </PanelWrap>
  );
};

export const HrJobsManagementPanel = memo(HrJobsManagementPanelComponent);
