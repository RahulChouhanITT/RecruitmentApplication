import { memo, useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useScheduleInterviewMutation } from '../../api/jobsApi';
import { JOBS_INITIAL_VALUES } from '../../constants/jobConstants';
import { JOBS_DEFAULT_MESSAGES, JOBS_SUCCESS_MESSAGES, JOBS_UI_TEXT } from '../../labels/jobLabels';
import type { InterviewerOption } from '../../../hr/types/hrTypes';
import type { ScheduleInterviewFormValues } from '../../types/jobTypes';
import { getJobsErrorMessage, validateScheduleFormValues } from '../../utils/jobValidation';
import { showToast, TOAST_TYPES } from '../../../../utils/toast';
import { Spinner } from '../../../../shared/components/Button/Button.styles';
import { Button } from '../../../../shared/ui/Button';
import { Select } from '../../../../shared/ui/Select';
import {
  DurationButton,
  DurationGroup,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  ModalActions,
  ModalOverlay,
  ModalTitle,
  ScheduleFormGrid,
  ScheduleModalCard,
  ScheduleSection,
  ScheduleTimeLayout,
  Textarea,
} from '../JobsPanel/JobsPanel.styles';

type InterviewSchedulingModalProps = {
  applicationId?: string;
  interviewerOptions: InterviewerOption[];
  isOpen: boolean;
  onClose: () => void;
};

const getInitialFormValues = (interviewerOptions: InterviewerOption[]): ScheduleInterviewFormValues => ({
  selectedDateTime: JOBS_INITIAL_VALUES.SCHEDULE_FORM.selectedDateTime,
  durationMinutes: JOBS_INITIAL_VALUES.SCHEDULE_FORM.durationMinutes,
  interviewerId: interviewerOptions[0]?._id ?? JOBS_INITIAL_VALUES.SCHEDULE_FORM.interviewerId,
  notes: JOBS_INITIAL_VALUES.SCHEDULE_FORM.notes,
});

const InterviewSchedulingModalComponent = ({
  applicationId,
  interviewerOptions,
  isOpen,
  onClose,
}: InterviewSchedulingModalProps) => {
  const [formValues, setFormValues] = useState<ScheduleInterviewFormValues>(
    getInitialFormValues(interviewerOptions),
  );
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ScheduleInterviewFormValues, string>>>({});
  const [scheduleInterview, { isLoading: isSchedulingInterview }] = useScheduleInterviewMutation();

  useEffect(() => {
    setFormValues(getInitialFormValues(interviewerOptions));
    setFormErrors({});
  }, [interviewerOptions, isOpen]);

  const selectedInterviewDate = useMemo(() => {
    if (!formValues.selectedDateTime) {
      return '';
    }

    const year = formValues.selectedDateTime.getFullYear();
    const month = String(formValues.selectedDateTime.getMonth() + 1).padStart(2, '0');
    const day = String(formValues.selectedDateTime.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }, [formValues.selectedDateTime]);

  const selectedInterviewTime = useMemo(() => {
    if (!formValues.selectedDateTime) {
      return '';
    }

    const hours = String(formValues.selectedDateTime.getHours()).padStart(2, '0');
    const minutes = String(formValues.selectedDateTime.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }, [formValues.selectedDateTime]);

  if (!isOpen || !applicationId) {
    return null;
  }

  const onSubmit = async (): Promise<void> => {
    const nextErrors = validateScheduleFormValues(formValues);
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await scheduleInterview({
        applicationId,
        payload: {
          interviewDate: selectedInterviewDate,
          interviewTime: selectedInterviewTime,
          interviewerId: formValues.interviewerId.trim(),
          notes: formValues.notes.trim(),
        },
      }).unwrap();

      showToast({ type: TOAST_TYPES.SUCCESS, message: JOBS_SUCCESS_MESSAGES.INTERVIEW_SCHEDULED });
      onClose();
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getJobsErrorMessage(error, JOBS_DEFAULT_MESSAGES.SCHEDULE_INTERVIEW_FAILED),
      });
    }
  };

  return (
    <ModalOverlay>
      <ScheduleModalCard>
        <ModalTitle>{JOBS_UI_TEXT.SCHEDULE_INTERVIEW}</ModalTitle>
        <ScheduleFormGrid>
          <FieldGroup style={{ gridColumn: '1 / -1' }}>
            <FieldLabel>{JOBS_UI_TEXT.INTERVIEW_DATE_TIME}</FieldLabel>
            <ScheduleSection>
              <ScheduleTimeLayout>
                <FieldGroup>
                  <FieldLabel>{JOBS_UI_TEXT.PICK_A_SLOT}</FieldLabel>
                  <DatePicker
                    selected={formValues.selectedDateTime}
                    onChange={(date: Date | null) => {
                      setFormValues((prev) => ({ ...prev, selectedDateTime: date }));
                      setFormErrors((prev) => ({ ...prev, selectedDateTime: '' }));
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
                        $active={formValues.durationMinutes === minutes}
                        onClick={() =>
                          setFormValues((prev) => ({
                            ...prev,
                            durationMinutes: minutes as 30 | 60 | 90,
                          }))
                        }
                      >
                        {minutes} {JOBS_UI_TEXT.MINUTES_SUFFIX}
                      </DurationButton>
                    ))}
                  </DurationGroup>
                </FieldGroup>
              </ScheduleTimeLayout>
            </ScheduleSection>
            <FieldError>{formErrors.selectedDateTime || JOBS_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
          </FieldGroup>

          <FieldGroup style={{ gridColumn: '1 / -1' }}>
            <FieldLabel>{JOBS_UI_TEXT.AVAILABLE_INTERVIEWERS}</FieldLabel>
            <ScheduleSection>
              <Select
                value={formValues.interviewerId}
                onChange={(event) => {
                  setFormValues((prev) => ({ ...prev, interviewerId: event.target.value }));
                  setFormErrors((prev) => ({ ...prev, interviewerId: '' }));
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
            <FieldError>{formErrors.interviewerId || JOBS_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
          </FieldGroup>

          <FieldGroup style={{ gridColumn: '1 / -1' }}>
            <FieldLabel>{JOBS_UI_TEXT.NOTES}</FieldLabel>
            <ScheduleSection>
              <Textarea
                placeholder={JOBS_UI_TEXT.OPTIONAL_INTERVIEW_NOTES}
                value={formValues.notes}
                onChange={(event) => setFormValues((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </ScheduleSection>
            <FieldError>{JOBS_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
          </FieldGroup>
        </ScheduleFormGrid>

        <ModalActions>
          <Button type="button" $variant="ghost" onClick={onClose} disabled={isSchedulingInterview}>
            {JOBS_UI_TEXT.CANCEL}
          </Button>
          <Button type="button" onClick={() => void onSubmit()} disabled={isSchedulingInterview}>
            {isSchedulingInterview ? <Spinner aria-hidden="true" /> : null}
            <span>{isSchedulingInterview ? JOBS_UI_TEXT.SCHEDULING : JOBS_UI_TEXT.SCHEDULE_INTERVIEW}</span>
          </Button>
        </ModalActions>
      </ScheduleModalCard>
    </ModalOverlay>
  );
};

export const InterviewSchedulingModal = memo(InterviewSchedulingModalComponent);
