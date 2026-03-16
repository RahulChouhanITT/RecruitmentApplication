import { createPortal } from "react-dom";
import { FiArrowLeft, FiBriefcase, FiClock, FiFileText, FiInfo, FiLayers, FiMoreVertical, FiPlus, FiUsers } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  APPLICATION_STATUS_SEQUENCE,
  JOBS_FIELD_LIMITS,
} from "../../constants/jobConstants";
import {
  APPLICATION_STATUS_LABELS,
  JOBS_PANEL_TEXT,
  JOBS_DEFAULT_MESSAGES,
  JOBS_EXPERIENCE_OPTIONS,
  JOBS_UI_TEXT,
  JOBS_FILTER_LABELS,
} from "../../labels/jobLabels";
import type { ApplicationStatus, JobsPanelProps } from "../../types/jobTypes";
import { useJobsPanel } from "../../hooks/useJobsPanel";
import { DashboardDescription } from "../../../dashboard/pages/DashboardPage/DashboardPage.styles";
import { EmptyStateCard } from "../../../dashboard/components/EmptyStateCard/EmptyStateCard";
import {
  ApplicationsGrid,
  ApplicationsTable,
  ApplicationsTableWrap,
  FloatingMenuDropdown,
  ControlsBar,
  BackButton,
  Button,
  ConfirmMessage,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLabelRow,
  FilterBar,
  FilterButton,
  FilterSelect,
  FloatingAddButton,
  FormGrid,
  InfoIconWrapper,
  GhostButton,
  Input,
  JobCard,
  JobDescription,
  JobDescriptionRow,
  JobHeader,
  JobMetaItem,
  JobMetaRow,
  JobTitleWrap,
  Meta,
  MenuContainer,
  MenuOption,
  MenuTrigger,
  ModalActions,
  ModalCard,
  ModalOverlay,
  ModalTitle,
  PanelWrap,
  Row,
  SectionTitle,
  Select,
  ScheduleTimeLayout,
  DurationGroup,
  DurationButton,
  ScheduleModalCard,
  ScheduleFormGrid,
  ScheduleSection,
  StatusOptionButton,
  StatusOptionList,
  StatusSelectionRow,
  StatusText,
  StatusPill,
  StickySectionHeader,
  Textarea,
  Title,
  TooltipText,
} from "./JobsPanel.styles";
import { SearchInput } from "../../../../shared/components/SearchInput";

export const JobsPanel = ({ role, activePanelId }: JobsPanelProps) => {
  const {
    isHr,
    isCandidate,
    isHrManageView,
    isHrApplicationsView,
    allJobsFilter,
    setAllJobsFilter,
    manageSearchQuery,
    setManageSearchQuery,
    selectedApplicationsJobId,
    setSelectedApplicationsJobId,
    applicationsJobsFilter,
    setApplicationsJobsFilter,
    applicationsJobsSearchQuery,
    setApplicationsJobsSearchQuery,
    applicationsStatusFilter,
    setApplicationsStatusFilter,
    applicationsSearchQuery,
    setApplicationsSearchQuery,
    formValues,
    editingJobId,
    isModalOpen,
    formErrors,
    isScheduleModalOpen,
    scheduleFormValues,
    setScheduleFormValues,
    scheduleFormErrors,
    setScheduleFormErrors,
    actionMenuAnchor,
    setActionMenuAnchor,
    pendingAction,
    isChangeStatusModalOpen,
    selectedApplicationForStatusChange,
    selectedStatusForChange,
    setSelectedStatusForChange,
    pendingJobStatusAction,
    setPendingJobStatusAction,
    actionMenuRef,
    isHrJobsLoading,
    isCandidateJobsLoading,
    isJobApplicationsLoading,
    isCreatingJob,
    isUpdatingJob,
    isClosingJob,
    isActivatingJob,
    isApplyingJob,
    isUpdatingApplicationStatus,
    isSchedulingInterview,
    interviewerOptions,
    jobsToRender,
    jobsEmptyMessage,
    selectedApplicationsJob,
    filteredHrJobApplications,
    filteredApplicationsJobs,
    selectedApplicationForAction,
    appliedJobIds,
    updateFormValue,
    resetForm,
    submitHrJob,
    onEditJob,
    onOpenCreateModal,
    onCloseJob,
    onActivateJob,
    onApply,
    closeScheduleInterviewModal,
    openChangeStatusModal,
    closeChangeStatusModal,
    closeConfirmationModal,
    confirmPendingAction,
    onRequestStatusChangeUpdate,
    onSubmitScheduleInterview,
    openActionMenuForRow,
    formatPostedAt,
    normalizeApplicationStatus,
  } = useJobsPanel({ role, activePanelId });

  if (!isHr && !isCandidate) {
    return (
        <EmptyStateCard
        title={JOBS_DEFAULT_MESSAGES.JOBS_UNAVAILABLE_TITLE}
        description={JOBS_DEFAULT_MESSAGES.JOBS_UNAVAILABLE_DESCRIPTION}
      />
    );
  }

  if ((isHr && isHrJobsLoading) || (isCandidate && isCandidateJobsLoading)) {
    return <DashboardDescription>{JOBS_DEFAULT_MESSAGES.LOADING_JOBS}</DashboardDescription>;
  }

  const modalContent =
    isHr && isModalOpen ? (
      <ModalOverlay>
        <ModalCard>
          <ModalTitle>{editingJobId ? JOBS_UI_TEXT.UPDATE_JOB : JOBS_UI_TEXT.CREATE_JOB}</ModalTitle>

          <FormGrid>
            <FieldGroup>
              <FieldLabel>{JOBS_UI_TEXT.JOB_TITLE}</FieldLabel>
              <Input
                placeholder={JOBS_PANEL_TEXT.JOB_TITLE_PLACEHOLDER}
                maxLength={JOBS_FIELD_LIMITS.title}
                value={formValues.title}
                onChange={(event) => updateFormValue("title", event.target.value)}
              />
              <FieldError>{formErrors.title || JOBS_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>{JOBS_UI_TEXT.EXPERIENCE_LEVEL}</FieldLabel>
              <Select
                value={formValues.experienceLevel}
                onChange={(event) => updateFormValue("experienceLevel", event.target.value)}
              >
                <option value="">{JOBS_PANEL_TEXT.EXPERIENCE_RANGE_PLACEHOLDER}</option>
                {JOBS_EXPERIENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <FieldError>{formErrors.experienceLevel || JOBS_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </FieldGroup>

            <FieldGroup>
              <FieldLabelRow>
                <FieldLabel>{JOBS_UI_TEXT.REQUIRED_SKILLS}</FieldLabel>
                <InfoIconWrapper>
                  <FiInfo size={13} />
                  <TooltipText>{JOBS_PANEL_TEXT.REQUIRED_SKILLS_TOOLTIP}</TooltipText>
                </InfoIconWrapper>
              </FieldLabelRow>
              <Input
                placeholder={JOBS_PANEL_TEXT.REQUIRED_SKILLS_PLACEHOLDER}
                maxLength={JOBS_FIELD_LIMITS.requiredSkills}
                value={formValues.requiredSkills}
                onChange={(event) => updateFormValue("requiredSkills", event.target.value)}
              />
              <FieldError>{formErrors.requiredSkills || JOBS_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </FieldGroup>

            <FieldGroup style={{ gridColumn: "1 / -1" }}>
              <FieldLabelRow>
                <FieldLabel>{JOBS_UI_TEXT.JOB_DESCRIPTION}</FieldLabel>
                <InfoIconWrapper>
                  <FiInfo size={13} />
                  <TooltipText>
                    {JOBS_PANEL_TEXT.JOB_DESCRIPTION_TOOLTIP(
                      JOBS_FIELD_LIMITS.descriptionWords,
                      JOBS_FIELD_LIMITS.description
                    )}
                  </TooltipText>
                </InfoIconWrapper>
              </FieldLabelRow>
              <Textarea
                placeholder={JOBS_PANEL_TEXT.JOB_DESCRIPTION_PLACEHOLDER}
                maxLength={JOBS_FIELD_LIMITS.description}
                value={formValues.description}
                onChange={(event) => updateFormValue("description", event.target.value)}
              />
              <FieldError>{formErrors.description || JOBS_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </FieldGroup>
          </FormGrid>

          <ModalActions>
            <GhostButton type="button" onClick={resetForm}>
              {JOBS_UI_TEXT.CANCEL}
            </GhostButton>
            <Button type="button" disabled={isCreatingJob || isUpdatingJob} onClick={submitHrJob}>
              {editingJobId ? JOBS_UI_TEXT.UPDATE_JOB : JOBS_UI_TEXT.CREATE_JOB}
            </Button>
          </ModalActions>
        </ModalCard>
      </ModalOverlay>
    ) : null;

  const scheduleModalContent =
    isHr && isScheduleModalOpen ? (
      <ModalOverlay>
        <ScheduleModalCard>
          <ModalTitle>{JOBS_UI_TEXT.SCHEDULE_INTERVIEW}</ModalTitle>
          <ScheduleFormGrid>
            <FieldGroup style={{ gridColumn: "1 / -1" }}>
              <FieldLabel>{JOBS_UI_TEXT.INTERVIEW_DATE_TIME}</FieldLabel>
              <ScheduleSection>
                <ScheduleTimeLayout>
                  <FieldGroup>
                    <FieldLabel>{JOBS_UI_TEXT.PICK_A_SLOT}</FieldLabel>
                    <DatePicker
                      selected={scheduleFormValues.selectedDateTime}
                      onChange={(date: Date | null) => {
                        setScheduleFormValues((prev) => ({ ...prev, selectedDateTime: date }));
                        setScheduleFormErrors((prev) => ({ ...prev, selectedDateTime: "" }));
                      }}
                      minDate={new Date()}
                      showTimeSelect
                      timeIntervals={30}
                      dateFormat="yyyy-MM-dd h:mm aa"
                      placeholderText={JOBS_UI_TEXT.PICK_A_SLOT}
                      wrapperClassName="schedule-picker-wrap"
                      popperClassName="schedule-datepicker-popper"
                      calendarClassName="schedule-datepicker-calendar"
                      customInput={<Input />}
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>Duration</FieldLabel>
                    <DurationGroup>
                      {[30, 60, 90].map((minutes) => (
                        <DurationButton
                          key={minutes}
                          type="button"
                          $active={scheduleFormValues.durationMinutes === minutes}
                          onClick={() => setScheduleFormValues((prev) => ({ ...prev, durationMinutes: minutes as 30 | 60 | 90 }))}
                        >
                          {minutes} {JOBS_UI_TEXT.MINUTES_SUFFIX}
                        </DurationButton>
                      ))}
                    </DurationGroup>
                  </FieldGroup>
                </ScheduleTimeLayout>
              </ScheduleSection>
              <FieldError>{scheduleFormErrors.selectedDateTime || JOBS_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </FieldGroup>

            <FieldGroup style={{ gridColumn: "1 / -1" }}>
              <FieldLabel>{JOBS_UI_TEXT.AVAILABLE_INTERVIEWERS}</FieldLabel>
              <ScheduleSection>
                <Select
                  value={scheduleFormValues.interviewerId}
                  onChange={(event) => {
                    setScheduleFormValues((prev) => ({
                      ...prev,
                      interviewerId: event.target.value,
                    }));
                    setScheduleFormErrors((prev) => ({ ...prev, interviewerId: "" }));
                  }}
                >
                  <option value="">{JOBS_UI_TEXT.SELECT_INTERVIEWER}</option>
                  {interviewerOptions.map((interviewer) => (
                    <option key={interviewer._id} value={interviewer._id}>
                      {interviewer.name} ({interviewer.email})
                    </option>
                  ))}
                </Select>
              </ScheduleSection>
              <FieldError>{scheduleFormErrors.interviewerId || JOBS_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </FieldGroup>

            <FieldGroup style={{ gridColumn: "1 / -1" }}>
              <FieldLabel>{JOBS_UI_TEXT.NOTES}</FieldLabel>
              <ScheduleSection>
                <Textarea
                  placeholder={JOBS_UI_TEXT.OPTIONAL_INTERVIEW_NOTES}
                  value={scheduleFormValues.notes}
                  onChange={(event) => setScheduleFormValues((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </ScheduleSection>
              <FieldError>{JOBS_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </FieldGroup>
          </ScheduleFormGrid>
          <ModalActions>
            <GhostButton type="button" onClick={closeScheduleInterviewModal} disabled={isSchedulingInterview}>
              {JOBS_UI_TEXT.CANCEL}
            </GhostButton>
            <Button type="button" onClick={onSubmitScheduleInterview} disabled={isSchedulingInterview}>
              {isSchedulingInterview ? JOBS_UI_TEXT.SCHEDULING : JOBS_UI_TEXT.SCHEDULE_INTERVIEW}
            </Button>
          </ModalActions>
        </ScheduleModalCard>
      </ModalOverlay>
    ) : null;

  const confirmationModalContent = pendingAction ? (
    <ModalOverlay>
      <ModalCard>
        <ModalTitle>{JOBS_UI_TEXT.CONFIRM_STATUS_UPDATE}</ModalTitle>
        <ConfirmMessage>
          {JOBS_PANEL_TEXT.STATUS_CONFIRMATION(APPLICATION_STATUS_LABELS[pendingAction.status].toLowerCase())}
        </ConfirmMessage>
        <ModalActions>
          <GhostButton
            type="button"
            onClick={closeConfirmationModal}
            disabled={isUpdatingApplicationStatus || isSchedulingInterview}
          >
            {JOBS_UI_TEXT.CANCEL}
          </GhostButton>
          <Button
            type="button"
            onClick={() => void confirmPendingAction()}
            disabled={isUpdatingApplicationStatus || isSchedulingInterview}
          >
            {JOBS_UI_TEXT.CONFIRM}
          </Button>
        </ModalActions>
      </ModalCard>
    </ModalOverlay>
  ) : null;

  const changeStatusModalContent =
    isChangeStatusModalOpen && selectedApplicationForStatusChange ? (
      <ModalOverlay>
        <ModalCard>
          <ModalTitle>{JOBS_UI_TEXT.CHANGE_APPLICATION_STATUS}</ModalTitle>
          <FormGrid>
            <FieldGroup style={{ gridColumn: "1 / -1" }}>
              <StatusSelectionRow>
                <FieldLabel>{JOBS_UI_TEXT.SELECT_STATUS}</FieldLabel>
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
          </FormGrid>
          <ModalActions>
            <GhostButton type="button" onClick={closeChangeStatusModal} disabled={isUpdatingApplicationStatus}>
              {JOBS_UI_TEXT.CANCEL}
            </GhostButton>
            <Button type="button" onClick={onRequestStatusChangeUpdate} disabled={isUpdatingApplicationStatus}>
              {JOBS_UI_TEXT.UPDATE_STATUS}
            </Button>
          </ModalActions>
        </ModalCard>
      </ModalOverlay>
    ) : null;

  const jobConfirmationModalContent = pendingJobStatusAction ? (
    <ModalOverlay>
      <ModalCard>
        <ModalTitle>{JOBS_UI_TEXT.CONFIRM_JOB_STATUS}</ModalTitle>
        <ConfirmMessage>
          {JOBS_PANEL_TEXT.JOB_STATUS_CONFIRMATION(pendingJobStatusAction.action)}
        </ConfirmMessage>
        <ModalActions>
          <GhostButton
            type="button"
            onClick={() => setPendingJobStatusAction(null)}
            disabled={isClosingJob || isActivatingJob}
          >
            {JOBS_UI_TEXT.CANCEL}
          </GhostButton>
          <Button
            type="button"
            onClick={async () => {
              if (pendingJobStatusAction.action === "Close") {
                await onCloseJob(pendingJobStatusAction.jobId);
              } else {
                await onActivateJob(pendingJobStatusAction.jobId);
              }
              setPendingJobStatusAction(null);
            }}
            disabled={isClosingJob || isActivatingJob}
          >
            {JOBS_UI_TEXT.CONFIRM}
          </Button>
        </ModalActions>
      </ModalCard>
    </ModalOverlay>
  ) : null;

  return (
    <PanelWrap>
      {isHr && isHrManageView ? (
        <FloatingAddButton type="button" onClick={onOpenCreateModal} aria-label={JOBS_UI_TEXT.CREATE_JOB_ARIA}>
          <FiPlus size={20} />
        </FloatingAddButton>
      ) : null}

      {isHr && isHrApplicationsView ? (
        <ApplicationsGrid>
          {selectedApplicationsJobId ? (
            <>
              <Row>
                <BackButton type="button" aria-label={JOBS_UI_TEXT.BACK_TO_JOBS_ARIA} onClick={() => setSelectedApplicationsJobId("")}>
                  <FiArrowLeft size={15} />
                </BackButton>
              </Row>
              <StickySectionHeader>
                <SectionTitle>{JOBS_UI_TEXT.APPLICATIONS_FOR} {selectedApplicationsJob?.title || JOBS_UI_TEXT.SELECTED_JOB}</SectionTitle>
                <ControlsBar>
                  <SearchInput
                    value={applicationsSearchQuery}
                    onChange={(event) => setApplicationsSearchQuery(event.target.value)}
                    placeholder={JOBS_UI_TEXT.SEARCH_APPLICATIONS_TABLE_PLACEHOLDER}
                  />
                  <FilterSelect
                    aria-label={JOBS_UI_TEXT.FILTER_APPLICATIONS_ARIA}
                    value={applicationsStatusFilter}
                    onChange={(event: { target: { value: string; }; }) =>
                      setApplicationsStatusFilter(event.target.value as "all" | ApplicationStatus)
                    }
                  >
                    <option value="all">{JOBS_UI_TEXT.ALL_STATUSES}</option>
                    {APPLICATION_STATUS_SEQUENCE.map((status) => (
                      <option key={status} value={status}>
                        {APPLICATION_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </FilterSelect>
                </ControlsBar>
              </StickySectionHeader>
              {isJobApplicationsLoading ? <DashboardDescription>{JOBS_UI_TEXT.LOADING_APPLICATIONS}</DashboardDescription> : null}
              {!isJobApplicationsLoading && filteredHrJobApplications.length === 0 ? (
                <EmptyStateCard
                  title={JOBS_UI_TEXT.NO_APPLICATIONS}
                  description={JOBS_UI_TEXT.NO_APPLICATIONS_FOR_JOB_DESCRIPTION}
                />
              ) : null}
              {!isJobApplicationsLoading && filteredHrJobApplications.length > 0 ? (
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
                        <tr key={application._id} data-selected={actionMenuAnchor?.applicationId === application._id}>
                          <td>{application.candidate.name}</td>
                          <td>{application.candidate.email}</td>
                          <td>{application.profile.skills || "-"}</td>
                          <td>{application.profile.experienceYears ?? 0} {JOBS_UI_TEXT.YEARS_SUFFIX}</td>
                          <td>
                            {application.profile.resumeUrl ? (
                              <a href={application.profile.resumeUrl} target="_blank" rel="noreferrer">
                                {JOBS_UI_TEXT.VIEW_RESUME}
                              </a>
                            ) : (
                              "-"
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
                      $active={applicationsJobsFilter === "all"}
                      onClick={() => setApplicationsJobsFilter("all")}
                    >
                      {JOBS_FILTER_LABELS.all}
                    </FilterButton>
                    <FilterButton
                      type="button"
                      $active={applicationsJobsFilter === "active"}
                      onClick={() => setApplicationsJobsFilter("active")}
                    >
                      {JOBS_FILTER_LABELS.active}
                    </FilterButton>
                    <FilterButton
                      type="button"
                      $active={applicationsJobsFilter === "closed"}
                      onClick={() => setApplicationsJobsFilter("closed")}
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
                filteredApplicationsJobs.map((job) => (
                  <JobCard key={`applications-${job._id}`}>
                    <JobHeader>
                      <JobTitleWrap>
                        <Title>{job.title}</Title>
                      </JobTitleWrap>
                      <StatusPill $active={job.isActive}>{job.isActive ? JOBS_UI_TEXT.ACTIVE_STATUS : JOBS_UI_TEXT.STATUS_CLOSED}</StatusPill>
                    </JobHeader>
                    <JobMetaRow>
                      <JobMetaItem>
                        <FiLayers size={14} />
                        {job.requiredSkills}
                      </JobMetaItem>
                    </JobMetaRow>
                    <JobMetaRow>
                      <JobMetaItem>
                        <FiBriefcase size={14} />
                        {job.experienceLevel}
                      </JobMetaItem>
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
                ))
              )}
            </>
          )}
        </ApplicationsGrid>
      ) : null}

      {isHr && isHrManageView ? (
        <StickySectionHeader>
          <SectionTitle>{JOBS_UI_TEXT.MANAGE_JOBS_TITLE}</SectionTitle>
          <ControlsBar>
            <SearchInput
              value={manageSearchQuery}
              onChange={(event) => setManageSearchQuery(event.target.value)}
              placeholder={JOBS_UI_TEXT.SEARCH_MANAGE_PLACEHOLDER}
            />
            <FilterBar>
              <FilterButton type="button" $active={allJobsFilter === "all"} onClick={() => setAllJobsFilter("all")}>
                {JOBS_UI_TEXT.ALL_JOBS}
              </FilterButton>
              <FilterButton
                type="button"
                $active={allJobsFilter === "active"}
                onClick={() => setAllJobsFilter("active")}
              >
                {JOBS_UI_TEXT.ACTIVE_STATUS}
              </FilterButton>
              <FilterButton
                type="button"
                $active={allJobsFilter === "closed"}
                onClick={() => setAllJobsFilter("closed")}
              >
                {JOBS_UI_TEXT.CLOSED_STATUS}
              </FilterButton>
            </FilterBar>
          </ControlsBar>
        </StickySectionHeader>
      ) : null}

      {jobsToRender.length === 0 && !isHrApplicationsView ? (
        <EmptyStateCard
          title={JOBS_UI_TEXT.NO_JOBS}
          description={jobsEmptyMessage}
        />
      ) : null}

      {jobsToRender.map((job) => (
        <JobCard key={job._id}>
          <JobHeader>
            <JobTitleWrap>
              <Title>{job.title}</Title>
            </JobTitleWrap>
            <StatusPill $active={job.isActive}>{job.isActive ? JOBS_UI_TEXT.STATUS_ACTIVE_HIRING : JOBS_UI_TEXT.STATUS_CLOSED}</StatusPill>
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
            <Meta>{JOBS_UI_TEXT.UPDATED} {formatPostedAt(job.updatedAt)}</Meta>
          </JobMetaRow>

          {isHr && isHrManageView ? (
            <Row>
              <Button type="button" onClick={() => onEditJob(job)}>
                {JOBS_UI_TEXT.EDIT}
              </Button>
              {job.isActive ? (
                <GhostButton type="button" disabled={isClosingJob} onClick={() => setPendingJobStatusAction({ jobId: job._id, action: "Close" })}>
                  {JOBS_UI_TEXT.CLOSE}
                </GhostButton>
              ) : (
                <GhostButton type="button" disabled={isActivatingJob} onClick={() => setPendingJobStatusAction({ jobId: job._id, action: "Activate" })}>
                  {JOBS_UI_TEXT.ACTIVATE}
                </GhostButton>
              )}
            </Row>
          ) : null}

          {isCandidate ? (
            <Row>
              <Button
                type="button"
                disabled={isApplyingJob || appliedJobIds.has(job._id)}
                onClick={() => onApply(job._id)}
              >
                {appliedJobIds.has(job._id) ? JOBS_UI_TEXT.STATUS_APPLIED : JOBS_UI_TEXT.ACTION_APPLY}
              </Button>
            </Row>
          ) : null}
        </JobCard>
      ))}
      {modalContent && typeof document !== "undefined" ? createPortal(modalContent, document.body) : null}
      {scheduleModalContent && typeof document !== "undefined"
        ? createPortal(scheduleModalContent, document.body)
        : null}
      {confirmationModalContent && typeof document !== "undefined"
        ? createPortal(confirmationModalContent, document.body)
        : null}
      {jobConfirmationModalContent && typeof document !== "undefined"
        ? createPortal(jobConfirmationModalContent, document.body)
        : null}
      {changeStatusModalContent && typeof document !== "undefined"
        ? createPortal(changeStatusModalContent, document.body)
        : null}
      {actionMenuAnchor && typeof document !== "undefined"
        ? createPortal(
          <FloatingMenuDropdown
            ref={actionMenuRef}
            style={{ top: `${actionMenuAnchor.top}px`, left: `${actionMenuAnchor.left}px` }}
          >
            <MenuOption
              type="button"
              onClick={() => {
                if (selectedApplicationForAction) {
                  openChangeStatusModal(selectedApplicationForAction);
                }
              }}
            >
              {JOBS_UI_TEXT.CHANGE_STATUS}
            </MenuOption>
          </FloatingMenuDropdown>,
          document.body
        )
        : null}
    </PanelWrap>
  );
};
