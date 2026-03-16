import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  FiBriefcase,
  FiCheckCircle,
  FiEdit2,
  FiInfo,
  FiLayers,
  FiMapPin,
  FiPhone,
  FiTool,
  FiUserCheck,
} from "react-icons/fi";
import { useGetProfileQuery } from "../../../auth/api/authApi";
import { useUploadResumeMutation } from "../../../candidate/api/candidateApi";
import type { AuthRole, CompleteProfilePayload } from "../../../auth/types";
import { ERROR_MESSAGES } from "../../../../utils/constants/messages/errorMessages";
import { VALIDATION_MESSAGES } from "../../../../utils/constants/messages/validationMessages";
import { ModalPortal } from "../../../../shared/components/ModalPortal/ModalPortal";
import {
  PROFILE_INITIAL_VALUES,
  PROFILE_FORM_LIMITS,
  PROFILE_RESUME_ACCEPTED_EXTENSIONS,
  PROFILE_RESUME_ACCEPTED_MIME_TYPES,
} from "../../constants";
import {
  PROFILE_DEFAULT_MESSAGES,
  PROFILE_UI_TEXT,
  PROFILE_VALIDATION_MESSAGES,
} from "../../labels/profileLabels";
import {
  Actions,
  Button,
  Card,
  Description,
  Field,
  FieldError,
  HiddenFileInput,
  Input,
  LabelRow,
  Overlay,
  PrimaryButton,
  ResumeActionRow,
  ResumeButton,
  ResumeCard,
  ResumeHeaderRow,
  ResumeInfoButton,
  ResumeInfoTooltip,
  ResumeInfoWrap,
  ResumeIconButton,
  ResumeUploadedLink,
  ResumeUploadedRow,
  Row,
  Title,
} from "./ProfileCompletionModal.styles";

type ProfileCompletionModalProps = {
  isOpen: boolean;
  role?: AuthRole;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (payload: CompleteProfilePayload) => Promise<void>;
};

const initialPayload: CompleteProfilePayload = PROFILE_INITIAL_VALUES.COMPLETE_PROFILE_PAYLOAD;

const toFormValues = (profile?: CompleteProfilePayload): CompleteProfilePayload => ({
  phone: profile?.phone ?? "",
  resumeUrl: profile?.resumeUrl ?? "",
  skills: profile?.skills ?? "",
  experienceYears: typeof profile?.experienceYears === "number" ? profile.experienceYears : 0,
  currentLocation: profile?.currentLocation ?? "",
  position: profile?.position ?? "",
  experienceLevel: profile?.experienceLevel ?? "",
  department: profile?.department ?? "",
  techStack: profile?.techStack ?? "",
});

export const ProfileCompletionModal = ({
  isOpen,
  role,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: ProfileCompletionModalProps) => {
  const [formValues, setFormValues] = useState<CompleteProfilePayload>(initialPayload);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CompleteProfilePayload, string>>>({});
  const [resumeUrlOverride, setResumeUrlOverride] = useState<string | null>(null);
  const { data: profileResponse } = useGetProfileQuery();
  const [uploadResume, { isLoading: isUploadingResume }] = useUploadResumeMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isCandidate = role === "candidate";
  const isHr = role === "hr";
  const isInterviewer = role === "interviewer";
  const existingResumeUrl = profileResponse?.data?.resumeUrl?.trim() ?? "";
  const effectiveResumeUrl = (resumeUrlOverride ?? existingResumeUrl).trim();
  const hasResume = Boolean(effectiveResumeUrl);
  const isResumeActionInProgress = isUploadingResume;
  const isSaveDisabled = isSubmitting || isResumeActionInProgress;

  useEffect(() => {
    if (!isOpen) {
      setFieldErrors({});
      setResumeUrlOverride(null);
      return;
    }

    setFormValues(toFormValues(profileResponse?.data));
    setFieldErrors({});
    setResumeUrlOverride(null);
  }, [isOpen, profileResponse?.data, role]);

  const title = useMemo(() => {
    if (isHr) {
      return PROFILE_UI_TEXT.COMPLETE_HR_PROFILE;
    }
    if (isInterviewer) {
      return PROFILE_UI_TEXT.COMPLETE_INTERVIEWER_PROFILE;
    }
    return PROFILE_UI_TEXT.COMPLETE_CANDIDATE_PROFILE;
  }, [isHr, isInterviewer]);

  const updateValue = (key: keyof CompleteProfilePayload, value: string | number): void => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof CompleteProfilePayload, string>> = {};

    if (isCandidate) {
      const normalizedPhone = (formValues.phone ?? "").replace(/\D/g, "");
      if (!normalizedPhone) {
        nextErrors.phone = PROFILE_VALIDATION_MESSAGES.PHONE_REQUIRED;
      } else if (normalizedPhone.length !== PROFILE_FORM_LIMITS.phoneDigits) {
        nextErrors.phone = PROFILE_VALIDATION_MESSAGES.PHONE_INVALID;
      }
      if (!effectiveResumeUrl) {
        nextErrors.resumeUrl = PROFILE_VALIDATION_MESSAGES.RESUME_REQUIRED;
      }
      if (!formValues.skills?.trim()) {
        nextErrors.skills = PROFILE_VALIDATION_MESSAGES.SKILLS_REQUIRED;
      } else if ((formValues.skills ?? "").trim().length > PROFILE_FORM_LIMITS.maxSkillsLength) {
        nextErrors.skills = PROFILE_VALIDATION_MESSAGES.SKILLS_MAX_LENGTH(PROFILE_FORM_LIMITS.maxSkillsLength);
      }
      if (
        formValues.experienceYears === undefined ||
        Number.isNaN(Number(formValues.experienceYears)) ||
        Number(formValues.experienceYears) < 0 ||
        Number(formValues.experienceYears) > PROFILE_FORM_LIMITS.maxExperienceYears
      ) {
        nextErrors.experienceYears = PROFILE_VALIDATION_MESSAGES.EXPERIENCE_INVALID;
      }
      if (!formValues.currentLocation?.trim()) {
        nextErrors.currentLocation = PROFILE_VALIDATION_MESSAGES.CURRENT_LOCATION_REQUIRED;
      } else if ((formValues.currentLocation ?? "").trim().length > PROFILE_FORM_LIMITS.maxLocationLength) {
        nextErrors.currentLocation = PROFILE_VALIDATION_MESSAGES.CURRENT_LOCATION_MAX_LENGTH(PROFILE_FORM_LIMITS.maxLocationLength);
      }
    }

    if (isHr) {
      if (!formValues.position?.trim()) {
        nextErrors.position = PROFILE_VALIDATION_MESSAGES.POSITION_REQUIRED;
      }
      if (!formValues.experienceLevel?.trim()) {
        nextErrors.experienceLevel = PROFILE_VALIDATION_MESSAGES.EXPERIENCE_LEVEL_REQUIRED;
      }
      if (!formValues.department?.trim()) {
        nextErrors.department = PROFILE_VALIDATION_MESSAGES.DEPARTMENT_REQUIRED;
      }
    }

    if (isInterviewer) {
      if (!formValues.position?.trim()) {
        nextErrors.position = PROFILE_VALIDATION_MESSAGES.POSITION_REQUIRED;
      }
      if (!formValues.techStack?.trim()) {
        nextErrors.techStack = PROFILE_VALIDATION_MESSAGES.TECH_STACK_REQUIRED;
      }
      if (!formValues.experienceLevel?.trim()) {
        nextErrors.experienceLevel = PROFILE_VALIDATION_MESSAGES.EXPERIENCE_LEVEL_REQUIRED;
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onFormSubmit = async (): Promise<void> => {
    if (!validate()) {
      return;
    }
    const payloadToSubmit: CompleteProfilePayload =
      isCandidate && effectiveResumeUrl
        ? {
            ...formValues,
            resumeUrl: effectiveResumeUrl,
          }
        : formValues;
    await onSubmit(payloadToSubmit);
  };

  const parseErrorMessage = (error: unknown, fallback: string): string => {
    if (typeof error === "object" && error !== null) {
      if ("data" in error && typeof (error as { data?: unknown }).data === "object" && (error as { data?: unknown }).data) {
        const message = (error as { data: { message?: unknown } }).data.message;
        if (typeof message === "string") {
          return message;
        }
      }
      if ("message" in error && typeof (error as { message?: unknown }).message === "string") {
        const message = String((error as { message: string }).message);
        if (message.toLowerCase().includes("network")) {
          return ERROR_MESSAGES.NETWORK_RETRY;
        }
        return message;
      }
    }
    return fallback;
  };

  const onResumeUploadClick = (): void => {
    if (isResumeActionInProgress || !isCandidate) {
      return;
    }
    fileInputRef.current?.click();
  };

  const onCandidatePhoneChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const digitsOnlyValue = event.target.value.replace(/\D/g, "").slice(0, PROFILE_FORM_LIMITS.phoneDigits);
    updateValue("phone", digitsOnlyValue);
  };

  const onResumeFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    const lowerName = selectedFile.name.toLowerCase();
    const hasAllowedExtension = PROFILE_RESUME_ACCEPTED_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
    const hasAllowedMimeType = PROFILE_RESUME_ACCEPTED_MIME_TYPES.includes(selectedFile.type as (typeof PROFILE_RESUME_ACCEPTED_MIME_TYPES)[number]);

    if (!hasAllowedExtension && !hasAllowedMimeType) {
      setFieldErrors((prev) => ({
        ...prev,
        resumeUrl: VALIDATION_MESSAGES.INVALID_RESUME_FILE_TYPE,
      }));
      event.target.value = "";
      return;
    }

    if (selectedFile.size > PROFILE_FORM_LIMITS.resumeMaxSizeBytes) {
      setFieldErrors((prev) => ({
        ...prev,
        resumeUrl: VALIDATION_MESSAGES.RESUME_FILE_TOO_LARGE,
      }));
      event.target.value = "";
      return;
    }

    try {
      const response = await uploadResume({ file: selectedFile }).unwrap();
      const resumeUrl = response.data?.resumeUrl ?? "";
      setResumeUrlOverride(resumeUrl);
      setFieldErrors((prev) => ({ ...prev, resumeUrl: "" }));
    } catch (error) {
      setFieldErrors((prev) => ({
        ...prev,
        resumeUrl: parseErrorMessage(error, PROFILE_DEFAULT_MESSAGES.RESUME_UPLOAD_FAILED),
      }));
    } finally {
      event.target.value = "";
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <ModalPortal isOpen={isOpen}>
      <Overlay>
        <Card>
        <Title>{title}</Title>
        {isCandidate ? (
          <Description>{PROFILE_UI_TEXT.COMPLETE_PROFILE_DESCRIPTION}</Description>
        ) : (
          <Description>{PROFILE_UI_TEXT.COMPLETE_REQUIRED_FIELDS}</Description>
        )}

        {isCandidate ? (
          <Row>
            <Field>
              <LabelRow>
                <FiPhone />
                {PROFILE_UI_TEXT.PHONE}
              </LabelRow>
              <Input
                value={formValues.phone ?? ""}
                onChange={onCandidatePhoneChange}
                placeholder={PROFILE_UI_TEXT.PHONE_PLACEHOLDER}
                inputMode="numeric"
                maxLength={PROFILE_FORM_LIMITS.phoneDigits}
              />
              <FieldError>{fieldErrors.phone || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </Field>
            <Field>
              <LabelRow>
                {PROFILE_UI_TEXT.RESUME}
                <ResumeInfoWrap>
                  <ResumeInfoButton type="button" aria-label={PROFILE_UI_TEXT.RESUME_INFO_ARIA}>
                    <FiInfo />
                  </ResumeInfoButton>
                  <ResumeInfoTooltip>{PROFILE_UI_TEXT.RESUME_UPLOAD_INFO}</ResumeInfoTooltip>
                </ResumeInfoWrap>
              </LabelRow>
              <ResumeCard>
                <ResumeHeaderRow>
                  {hasResume ? (
                    <ResumeUploadedLink
                      type="button"
                      onClick={() => window.open(effectiveResumeUrl, "_blank", "noopener,noreferrer")}
                      disabled={isResumeActionInProgress}
                      aria-label={PROFILE_UI_TEXT.OPEN_RESUME_ARIA}
                    >
                      <FiCheckCircle />
                      {PROFILE_UI_TEXT.RESUME_UPLOADED}
                    </ResumeUploadedLink>
                  ) : (
                    <ResumeUploadedRow>
                      <FiCheckCircle />
                      {PROFILE_UI_TEXT.NO_RESUME}
                    </ResumeUploadedRow>
                  )}
                  {hasResume ? (
                    <ResumeIconButton
                      type="button"
                      onClick={onResumeUploadClick}
                      disabled={isResumeActionInProgress}
                      title={PROFILE_UI_TEXT.REPLACE_RESUME}
                      aria-label={PROFILE_UI_TEXT.REPLACE_RESUME}
                    >
                      <FiEdit2 />
                    </ResumeIconButton>
                  ) : null}
                </ResumeHeaderRow>
                <HiddenFileInput
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={onResumeFileChange}
                  disabled={isResumeActionInProgress}
                />
                {!hasResume ? (
                  <ResumeActionRow>
                    <ResumeButton type="button" onClick={onResumeUploadClick} disabled={isResumeActionInProgress}>
                      {isUploadingResume ? PROFILE_UI_TEXT.UPLOADING : PROFILE_UI_TEXT.UPLOAD_RESUME}
                    </ResumeButton>
                  </ResumeActionRow>
                ) : null}
              </ResumeCard>
              <FieldError>{fieldErrors.resumeUrl || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </Field>
            <Field>
              <LabelRow>
                <FiTool />
                {PROFILE_UI_TEXT.SKILLS}
              </LabelRow>
              <Input
                value={formValues.skills ?? ""}
                onChange={(e) => updateValue("skills", e.target.value)}
                placeholder={PROFILE_UI_TEXT.SKILLS_PLACEHOLDER}
                maxLength={PROFILE_FORM_LIMITS.maxSkillsLength}
              />
              <FieldError>{fieldErrors.skills || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </Field>
            <Field>
              <LabelRow>
                <FiBriefcase />
                {PROFILE_UI_TEXT.EXPERIENCE_YEARS}
              </LabelRow>
              <Input
                type="number"
                min={0}
                max={PROFILE_FORM_LIMITS.maxExperienceYears}
                value={formValues.experienceYears ?? 0}
                onChange={(e) => updateValue("experienceYears", Number(e.target.value))}
                placeholder={PROFILE_UI_TEXT.EXPERIENCE_YEARS_PLACEHOLDER}
              />
              <FieldError>{fieldErrors.experienceYears || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </Field>
            <Field>
              <LabelRow>
                <FiMapPin />
                {PROFILE_UI_TEXT.CURRENT_LOCATION}
              </LabelRow>
              <Input
                value={formValues.currentLocation ?? ""}
                onChange={(e) => updateValue("currentLocation", e.target.value)}
                placeholder={PROFILE_UI_TEXT.CURRENT_LOCATION_PLACEHOLDER}
                maxLength={PROFILE_FORM_LIMITS.maxLocationLength}
              />
              <FieldError>{fieldErrors.currentLocation || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </Field>
          </Row>
        ) : null}

        {isHr ? (
          <Row>
            <Field>
              <LabelRow>
                <FiUserCheck />
                {PROFILE_UI_TEXT.POSITION}
              </LabelRow>
              <Input
                value={formValues.position ?? ""}
                onChange={(e) => updateValue("position", e.target.value)}
                placeholder={PROFILE_UI_TEXT.POSITION_PLACEHOLDER_HR}
              />
              <FieldError>{fieldErrors.position || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </Field>
            <Field>
              <LabelRow>
                <FiBriefcase />
                {PROFILE_UI_TEXT.EXPERIENCE_LEVEL}
              </LabelRow>
              <Input
                value={formValues.experienceLevel ?? ""}
                onChange={(e) => updateValue("experienceLevel", e.target.value)}
                placeholder={PROFILE_UI_TEXT.EXPERIENCE_LEVEL_PLACEHOLDER_HR}
              />
              <FieldError>{fieldErrors.experienceLevel || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </Field>
            <Field>
              <LabelRow>
                <FiLayers />
                {PROFILE_UI_TEXT.DEPARTMENT}
              </LabelRow>
              <Input
                value={formValues.department ?? ""}
                onChange={(e) => updateValue("department", e.target.value)}
                placeholder={PROFILE_UI_TEXT.DEPARTMENT_PLACEHOLDER}
              />
              <FieldError>{fieldErrors.department || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </Field>
          </Row>
        ) : null}

        {isInterviewer ? (
          <Row>
            <Field>
              <LabelRow>
                <FiUserCheck />
                {PROFILE_UI_TEXT.POSITION}
              </LabelRow>
              <Input
                value={formValues.position ?? ""}
                onChange={(e) => updateValue("position", e.target.value)}
                placeholder={PROFILE_UI_TEXT.POSITION_PLACEHOLDER_INTERVIEWER}
              />
              <FieldError>{fieldErrors.position || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </Field>
            <Field>
              <LabelRow>
                <FiTool />
                {PROFILE_UI_TEXT.TECH_STACK}
              </LabelRow>
              <Input
                value={formValues.techStack ?? ""}
                onChange={(e) => updateValue("techStack", e.target.value)}
                placeholder={PROFILE_UI_TEXT.TECH_STACK_PLACEHOLDER}
              />
              <FieldError>{fieldErrors.techStack || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </Field>
            <Field>
              <LabelRow>
                <FiBriefcase />
                {PROFILE_UI_TEXT.EXPERIENCE_LEVEL}
              </LabelRow>
              <Input
                value={formValues.experienceLevel ?? ""}
                onChange={(e) => updateValue("experienceLevel", e.target.value)}
                placeholder={PROFILE_UI_TEXT.EXPERIENCE_LEVEL_PLACEHOLDER_INTERVIEWER}
              />
              <FieldError>{fieldErrors.experienceLevel || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
            </Field>
          </Row>
        ) : null}

        <Actions>
          <Button type="button" onClick={onCancel}>
            {PROFILE_UI_TEXT.CANCEL}
          </Button>
          <PrimaryButton type="button" disabled={isSaveDisabled} onClick={onFormSubmit}>
            {isSubmitting ? PROFILE_UI_TEXT.SAVING : isUploadingResume ? PROFILE_UI_TEXT.UPLOADING : PROFILE_UI_TEXT.SAVE_PROFILE}
          </PrimaryButton>
        </Actions>
        </Card>
      </Overlay>
    </ModalPortal>
  );
};
