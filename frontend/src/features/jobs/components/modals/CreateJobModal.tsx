import { memo, useEffect, useMemo, useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { useCreateJobMutation, useUpdateJobMutation } from '../../api/jobsApi';
import { JOBS_FIELD_LIMITS, JOBS_INITIAL_VALUES } from '../../constants/jobConstants';
import {
  JOBS_DEFAULT_MESSAGES,
  JOBS_EXPERIENCE_OPTIONS,
  JOBS_PANEL_TEXT,
  JOBS_SUCCESS_MESSAGES,
  JOBS_UI_TEXT,
  JOBS_VALIDATION_MESSAGES,
} from '../../labels/jobLabels';
import type { CreateJobPayload, Job } from '../../types/jobTypes';
import { normalizeExperienceLevel } from '../../utils/jobPanelHelpers';
import { getJobsErrorMessage, validateJobFormValues } from '../../utils/jobValidation';
import { showToast, TOAST_TYPES } from '../../../../utils/toast';
import { Spinner } from '../../../../shared/components/Button/Button.styles';
import { Button } from '../../../../shared/ui/Button';
import { Select } from '../../../../shared/ui/Select';
import {
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLabelRow,
  FormGrid,
  InfoIconWrapper,
  Input,
  ModalActions,
  ModalCard,
  ModalOverlay,
  ModalTitle,
  Textarea,
  TooltipText,
} from '../JobsPanel/JobsPanel.styles';

type CreateJobModalProps = {
  isOpen: boolean;
  job?: Job | null;
  onClose: () => void;
};

const getInitialFormValues = (job?: Job | null): CreateJobPayload =>
  job
    ? {
        title: job.title,
        description: job.description,
        requiredSkills: job.requiredSkills,
        experienceLevel: normalizeExperienceLevel(job.experienceLevel),
      }
    : JOBS_INITIAL_VALUES.JOB_FORM;

const CreateJobModalComponent = ({ isOpen, job, onClose }: CreateJobModalProps) => {
  const [formValues, setFormValues] = useState<CreateJobPayload>(getInitialFormValues(job));
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateJobPayload, string>>>({});
  const [createJob, { isLoading: isCreatingJob }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdatingJob }] = useUpdateJobMutation();

  useEffect(() => {
    if (!isOpen) {
      setFormValues(JOBS_INITIAL_VALUES.JOB_FORM);
      setFormErrors({});
      return;
    }

    setFormValues(getInitialFormValues(job));
    setFormErrors({});
  }, [isOpen, job]);

  const modalTitle = useMemo(() => (job ? JOBS_UI_TEXT.UPDATE_JOB : JOBS_UI_TEXT.CREATE_JOB), [job]);

  if (!isOpen) {
    return null;
  }

  const updateFormValue = (key: keyof CreateJobPayload, value: string): void => {
    setFormValues((prev) => ({ ...prev, [key]: value }));

    if (key === 'description') {
      const descriptionWords = value.trim().split(/\s+/).filter(Boolean).length;
      if (descriptionWords > JOBS_FIELD_LIMITS.descriptionWords) {
        setFormErrors((prev) => ({
          ...prev,
          description: JOBS_VALIDATION_MESSAGES.DESCRIPTION_WORD_LIMIT(
            JOBS_FIELD_LIMITS.descriptionWords,
          ),
        }));
        return;
      }
    }

    setFormErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const onSubmit = async (): Promise<void> => {
    const nextErrors = validateJobFormValues(formValues);
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      if (job) {
        await updateJob({ jobId: job._id, payload: formValues }).unwrap();
        showToast({ type: TOAST_TYPES.SUCCESS, message: JOBS_SUCCESS_MESSAGES.JOB_UPDATED });
      } else {
        await createJob(formValues).unwrap();
        showToast({ type: TOAST_TYPES.SUCCESS, message: JOBS_SUCCESS_MESSAGES.JOB_CREATED });
      }

      onClose();
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getJobsErrorMessage(error, JOBS_DEFAULT_MESSAGES.SAVE_JOB_FAILED),
      });
    }
  };

  return (
    <ModalOverlay>
      <ModalCard>
        <ModalTitle>{modalTitle}</ModalTitle>
        <FormGrid>
          <FieldGroup>
            <FieldLabel>{JOBS_UI_TEXT.JOB_TITLE}</FieldLabel>
            <Input
              placeholder={JOBS_PANEL_TEXT.JOB_TITLE_PLACEHOLDER}
              maxLength={JOBS_FIELD_LIMITS.title}
              value={formValues.title}
              onChange={(event) => updateFormValue('title', event.target.value)}
            />
            <FieldError>{formErrors.title || JOBS_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>{JOBS_UI_TEXT.EXPERIENCE_LEVEL}</FieldLabel>
            <Select
              value={formValues.experienceLevel}
              onChange={(event) => updateFormValue('experienceLevel', event.target.value)}
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
              onChange={(event) => updateFormValue('requiredSkills', event.target.value)}
            />
            <FieldError>{formErrors.requiredSkills || JOBS_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
          </FieldGroup>

          <FieldGroup style={{ gridColumn: '1 / -1' }}>
            <FieldLabelRow>
              <FieldLabel>{JOBS_UI_TEXT.JOB_DESCRIPTION}</FieldLabel>
              <InfoIconWrapper>
                <FiInfo size={13} />
                <TooltipText>
                  {JOBS_PANEL_TEXT.JOB_DESCRIPTION_TOOLTIP(
                    JOBS_FIELD_LIMITS.descriptionWords,
                    JOBS_FIELD_LIMITS.description,
                  )}
                </TooltipText>
              </InfoIconWrapper>
            </FieldLabelRow>
            <Textarea
              placeholder={JOBS_PANEL_TEXT.JOB_DESCRIPTION_PLACEHOLDER}
              maxLength={JOBS_FIELD_LIMITS.description}
              value={formValues.description}
              onChange={(event) => updateFormValue('description', event.target.value)}
            />
            <FieldError>{formErrors.description || JOBS_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
          </FieldGroup>
        </FormGrid>

        <ModalActions>
          <Button type="button" $variant="ghost" onClick={onClose}>
            {JOBS_UI_TEXT.CANCEL}
          </Button>
          <Button type="button" disabled={isCreatingJob || isUpdatingJob} onClick={() => void onSubmit()}>
            {isCreatingJob || isUpdatingJob ? <Spinner aria-hidden="true" /> : null}
            <span>{modalTitle}</span>
          </Button>
        </ModalActions>
      </ModalCard>
    </ModalOverlay>
  );
};

export const CreateJobModal = memo(CreateJobModalComponent);
