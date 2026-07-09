import { createPortal } from 'react-dom';
import { memo } from 'react';
import { FiArrowLeft, FiLayers, FiMoreVertical, FiUsers } from 'react-icons/fi';
import { DashboardDescription } from '../../../dashboard/pages/DashboardPage/DashboardPage.styles';
import { EmptyStateCard } from '../../../dashboard/components/EmptyStateCard';
import { SearchInput } from '../../../../shared/components/SearchInput';
import { Button } from '../../../../shared/ui/Button';
import { Dropdown, DropdownItem } from '../../../../shared/ui/Dropdown';
import { Select } from '../../../../shared/ui/Select';
import { APPLICATION_STATUS_SEQUENCE } from '../../constants/jobConstants';
import { useHrApplications } from '../../hooks/useHrApplications';
import { JobsPagination } from '../JobsPagination';
import {
  APPLICATION_STATUS_LABELS,
  JOBS_DEFAULT_MESSAGES,
  JOBS_FILTER_LABELS,
  JOBS_PANEL_TEXT,
  JOBS_UI_TEXT,
} from '../../labels/jobLabels';
import type { ApplicationStatus } from '../../types/jobTypes';
import { InterviewSchedulingModal } from '../modals/InterviewSchedulingModal';
import {
  ApplicationsGrid,
  ApplicationsTable,
  ApplicationsTableWrap,
  BackButton,
  ConfirmMessage,
  ControlsBar,
  FieldError,
  FieldGroup,
  FilterBar,
  FilterButton,
  JobCard,
  JobHeader,
  JobMetaItem,
  JobMetaRow,
  JobTitleWrap,
  MenuContainer,
  MenuTrigger,
  ModalActions,
  ModalCard,
  ModalOverlay,
  ModalTitle,
  PanelWrap,
  Row,
  SectionTitle,
  StatusOptionButton,
  StatusOptionList,
  StatusPill,
  StatusSelectionRow,
  StatusText,
  StickySectionHeader,
  Title,
} from './HrJobApplicationsPanel.styles';

const HrJobApplicationsPanelComponent = () => {
  const {
    actionMenuAnchor,
    actionMenuRef,
    applicationsJobsFilter,
    setApplicationsJobsFilter,
    applicationsJobsSearchQuery,
    setApplicationsJobsSearchQuery,
    applicationsSearchQuery,
    setApplicationsSearchQuery,
    applicationsStatusFilter,
    setApplicationsStatusFilter,
    closeChangeStatusModal,
    closeConfirmationModal,
    closeScheduleModal,
    confirmPendingAction,
    filteredApplicationsJobs,
    filteredHrJobApplications,
    interviewerOptions,
    isChangeStatusModalOpen,
    isHrJobsLoading,
    isJobApplicationsLoading,
    isScheduleModalOpen,
    isUpdatingApplicationStatus,
    jobsPagination,
    applicationsPagination,
    jobsPage,
    setJobsPage,
    applicationsPage,
    setApplicationsPage,
    normalizeApplicationStatus,
    onRequestStatusChangeUpdate,
    openActionMenuForRow,
    openChangeStatusModal,
    pendingAction,
    selectedApplicationForAction,
    selectedApplicationForSchedule,
    selectedApplicationForStatusChange,
    selectedApplicationsJob,
    selectedApplicationsJobId,
    selectedStatusForChange,
    setActionMenuAnchor,
    setSelectedApplicationsJobId,
    setSelectedStatusForChange,
  } = useHrApplications();

  if (isHrJobsLoading) {
    return <DashboardDescription>{JOBS_DEFAULT_MESSAGES.LOADING_JOBS}</DashboardDescription>;
  }

  return (
    <PanelWrap>
      <ApplicationsGrid>
        {selectedApplicationsJobId ? (
          <>
            <Row>
              <BackButton
                type="button"
                aria-label={JOBS_UI_TEXT.BACK_TO_JOBS_ARIA}
                onClick={() => setSelectedApplicationsJobId('')}
              >
                <FiArrowLeft size={15} />
              </BackButton>
            </Row>
            <StickySectionHeader>
              <SectionTitle>
                {JOBS_UI_TEXT.APPLICATIONS_FOR} {selectedApplicationsJob?.title || JOBS_UI_TEXT.SELECTED_JOB}
              </SectionTitle>
              <ControlsBar>
                <SearchInput
                  value={applicationsSearchQuery}
                  onChange={(event) => setApplicationsSearchQuery(event.target.value)}
                  placeholder={JOBS_UI_TEXT.SEARCH_APPLICATIONS_TABLE_PLACEHOLDER}
                />
                <Select
                  $pill
                  aria-label={JOBS_UI_TEXT.FILTER_APPLICATIONS_ARIA}
                  value={applicationsStatusFilter}
                  onChange={(event) =>
                    setApplicationsStatusFilter(event.target.value as 'all' | ApplicationStatus)
                  }
                >
                  <option value="all">{JOBS_UI_TEXT.ALL_STATUSES}</option>
                  {APPLICATION_STATUS_SEQUENCE.map((status) => (
                    <option key={status} value={status}>
                      {APPLICATION_STATUS_LABELS[status]}
                    </option>
                  ))}
                </Select>
              </ControlsBar>
            </StickySectionHeader>

            {isJobApplicationsLoading ? (
              <DashboardDescription>{JOBS_UI_TEXT.LOADING_APPLICATIONS}</DashboardDescription>
            ) : null}

            {!isJobApplicationsLoading && filteredHrJobApplications.length === 0 ? (
              <EmptyStateCard
                title={JOBS_UI_TEXT.NO_APPLICATIONS}
                description={JOBS_UI_TEXT.NO_APPLICATIONS_FOR_JOB_DESCRIPTION}
              />
            ) : null}

            {!isJobApplicationsLoading && filteredHrJobApplications.length > 0 ? (
              <>
                <ApplicationsTableWrap>
                  <ApplicationsTable>
                    <thead>
                      <tr>
                        <th>{JOBS_UI_TEXT.CANDIDATE}</th>
                        <th>{JOBS_UI_TEXT.EMAIL}</th>
                        <th>{JOBS_UI_TEXT.SKILLS}</th>
                        <th>{JOBS_UI_TEXT.EXPERIENCE}</th>
                        <th>{JOBS_UI_TEXT.RESUME}</th>
                        <th>{JOBS_UI_TEXT.STATUS}</th>
                        <th aria-label={JOBS_UI_TEXT.ACTIONS} />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHrJobApplications.map((application) => (
                        <tr
                          key={application._id}
                          data-selected={actionMenuAnchor?.applicationId === application._id}
                        >
                          <td>{application.candidate.name}</td>
                          <td>{application.candidate.email}</td>
                          <td>{application.profile.skills || '-'}</td>
                          <td>
                            {application.profile.experienceYears ?? 0} {JOBS_UI_TEXT.YEARS_SUFFIX}
                          </td>
                          <td>
                            {application.profile.resumeUrl ? (
                              <a href={application.profile.resumeUrl} target="_blank" rel="noreferrer">
                                {JOBS_UI_TEXT.VIEW_RESUME}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>
                            <StatusText $status={normalizeApplicationStatus(application.status)}>
                              {APPLICATION_STATUS_LABELS[normalizeApplicationStatus(application.status)]}
                            </StatusText>
                          </td>
                          <td>
                            <MenuContainer>
                              <MenuTrigger
                                type="button"
                                aria-label={JOBS_UI_TEXT.OPEN_APPLICATION_ACTIONS_ARIA}
                                onClick={(event) => {
                                  const trigger = event.currentTarget;
                                  event.stopPropagation();

                                  if (actionMenuAnchor?.applicationId === application._id) {
                                    setActionMenuAnchor(null);
                                    return;
                                  }

                                  openActionMenuForRow(application._id, trigger);
                                }}
                              >
                                <FiMoreVertical size={15} />
                              </MenuTrigger>
                            </MenuContainer>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </ApplicationsTable>
                </ApplicationsTableWrap>
                <JobsPagination
                  pagination={applicationsPagination}
                  page={applicationsPage}
                  onPageChange={setApplicationsPage}
                />
              </>
            ) : null}
          </>
        ) : (
          <>
            <StickySectionHeader>
              <SectionTitle>{JOBS_UI_TEXT.JOBS_APPLICATIONS_TITLE}</SectionTitle>
              <ControlsBar>
                <SearchInput
                  value={applicationsJobsSearchQuery}
                  onChange={(event) => setApplicationsJobsSearchQuery(event.target.value)}
                  placeholder={JOBS_UI_TEXT.SEARCH_APPLICATIONS_JOBS_PLACEHOLDER}
                />
                <FilterBar>
                  <FilterButton
                    type="button"
                    $active={applicationsJobsFilter === 'all'}
                    onClick={() => setApplicationsJobsFilter('all')}
                  >
                    {JOBS_FILTER_LABELS.all}
                  </FilterButton>
                  <FilterButton
                    type="button"
                    $active={applicationsJobsFilter === 'active'}
                    onClick={() => setApplicationsJobsFilter('active')}
                  >
                    {JOBS_FILTER_LABELS.active}
                  </FilterButton>
                  <FilterButton
                    type="button"
                    $active={applicationsJobsFilter === 'closed'}
                    onClick={() => setApplicationsJobsFilter('closed')}
                  >
                    {JOBS_FILTER_LABELS.closed}
                  </FilterButton>
                </FilterBar>
              </ControlsBar>
            </StickySectionHeader>

            {filteredApplicationsJobs.length === 0 ? (
              <EmptyStateCard
                title={JOBS_UI_TEXT.NO_JOBS}
                description={JOBS_UI_TEXT.NO_FILTERED_JOBS_DESCRIPTION}
              />
            ) : (
              <>
                {filteredApplicationsJobs.map((job) => (
                  <JobCard key={`applications-${job._id}`}>
                    <JobHeader>
                      <JobTitleWrap>
                        <Title>{job.title}</Title>
                      </JobTitleWrap>
                      <StatusPill $active={job.isActive}>
                        {job.isActive ? JOBS_UI_TEXT.ACTIVE_STATUS : JOBS_UI_TEXT.STATUS_CLOSED}
                      </StatusPill>
                    </JobHeader>
                    <JobMetaRow>
                      <JobMetaItem>
                        <FiLayers size={14} />
                        {job.requiredSkills}
                      </JobMetaItem>
                    </JobMetaRow>
                    <JobMetaRow>
                      <JobMetaItem>
                        <FiUsers size={14} />
                        {job.applicationCount ?? 0} {JOBS_UI_TEXT.APPLICATIONS_SUFFIX}
                      </JobMetaItem>
                    </JobMetaRow>
                    <Row>
                      <Button type="button" onClick={() => setSelectedApplicationsJobId(job._id)}>
                        {JOBS_UI_TEXT.VIEW_APPLICATIONS}
                      </Button>
                    </Row>
                  </JobCard>
                ))}
                <JobsPagination
                  pagination={jobsPagination}
                  page={jobsPage}
                  onPageChange={setJobsPage}
                />
              </>
            )}
          </>
        )}
      </ApplicationsGrid>

      {pendingAction && typeof document !== 'undefined'
        ? createPortal(
            <ModalOverlay>
              <ModalCard>
                <ModalTitle>{JOBS_UI_TEXT.CONFIRM_STATUS_UPDATE}</ModalTitle>
                <ConfirmMessage>
                  {JOBS_PANEL_TEXT.STATUS_CONFIRMATION(
                    APPLICATION_STATUS_LABELS[pendingAction.status].toLowerCase(),
                  )}
                </ConfirmMessage>
                <ModalActions>
                  <Button
                    type="button"
                    $variant="ghost"
                    onClick={closeConfirmationModal}
                    disabled={isUpdatingApplicationStatus}
                  >
                    {JOBS_UI_TEXT.CANCEL}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void confirmPendingAction()}
                    disabled={isUpdatingApplicationStatus}
                  >
                    {JOBS_UI_TEXT.CONFIRM}
                  </Button>
                </ModalActions>
              </ModalCard>
            </ModalOverlay>,
            document.body,
          )
        : null}

      {isChangeStatusModalOpen && selectedApplicationForStatusChange && typeof document !== 'undefined'
        ? createPortal(
            <ModalOverlay>
              <ModalCard>
                <ModalTitle>{JOBS_UI_TEXT.CHANGE_APPLICATION_STATUS}</ModalTitle>
                <FieldGroup style={{ gridColumn: '1 / -1' }}>
                  <StatusSelectionRow>
                    <SectionTitle>{JOBS_UI_TEXT.SELECT_STATUS}</SectionTitle>
                    <StatusText $status={selectedStatusForChange}>
                      {APPLICATION_STATUS_LABELS[selectedStatusForChange]}
                    </StatusText>
                  </StatusSelectionRow>
                  <StatusOptionList>
                    {APPLICATION_STATUS_SEQUENCE.map((status) => (
                      <StatusOptionButton
                        key={status}
                        type="button"
                        $status={status}
                        $selected={selectedStatusForChange === status}
                        onClick={() => setSelectedStatusForChange(status)}
                      >
                        {APPLICATION_STATUS_LABELS[status]}
                      </StatusOptionButton>
                    ))}
                  </StatusOptionList>
                  <FieldError>{JOBS_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
                </FieldGroup>
                <ModalActions>
                  <Button
                    type="button"
                    $variant="ghost"
                    onClick={closeChangeStatusModal}
                    disabled={isUpdatingApplicationStatus}
                  >
                    {JOBS_UI_TEXT.CANCEL}
                  </Button>
                  <Button
                    type="button"
                    onClick={onRequestStatusChangeUpdate}
                    disabled={isUpdatingApplicationStatus}
                  >
                    {JOBS_UI_TEXT.UPDATE_STATUS}
                  </Button>
                </ModalActions>
              </ModalCard>
            </ModalOverlay>,
            document.body,
          )
        : null}

      {isScheduleModalOpen && typeof document !== 'undefined'
        ? createPortal(
            <InterviewSchedulingModal
              isOpen
              applicationId={selectedApplicationForSchedule?._id}
              interviewerOptions={interviewerOptions}
              onClose={closeScheduleModal}
            />,
            document.body,
          )
        : null}

      {actionMenuAnchor && typeof document !== 'undefined'
        ? createPortal(
            <Dropdown
              $fixed
              ref={actionMenuRef}
              style={{ top: `${actionMenuAnchor.top}px`, left: `${actionMenuAnchor.left}px` }}
            >
              <DropdownItem
                type="button"
                onClick={() => {
                  if (selectedApplicationForAction) {
                    openChangeStatusModal(selectedApplicationForAction);
                  }
                }}
              >
                {JOBS_UI_TEXT.CHANGE_STATUS}
              </DropdownItem>
            </Dropdown>,
            document.body,
          )
        : null}
    </PanelWrap>
  );
};

export const HrJobApplicationsPanel = memo(HrJobApplicationsPanelComponent);
