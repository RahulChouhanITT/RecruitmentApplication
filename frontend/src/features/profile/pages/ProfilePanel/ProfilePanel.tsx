import { useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  FiBriefcase,
  FiCheckCircle,
  FiEdit2,
  FiInfo,
  FiMail,
  FiMapPin,
  FiPhone,
  FiTool,
  FiUser,
  FiUserCheck,
} from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { useGetProfileQuery, useUpdateProfileMutation } from "../../../auth/api/authApi";
import { useUploadResumeMutation } from "../../../candidate/api/candidateApi";
import { setCurrentUser } from "../../../auth/state/authSlice";
import type { AuthRole, UpdateProfilePayload, UserProfile } from "../../../auth/types";
import { ERROR_MESSAGES } from "../../../../utils/constants/messages/errorMessages";
import { SUCCESS_MESSAGES } from "../../../../utils/constants/messages/successMessages";
import { VALIDATION_MESSAGES } from "../../../../utils/constants/messages/validationMessages";
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
import { DashboardDescription } from "../../../dashboard/pages/DashboardPage/DashboardPage.styles";
import { showToast, TOAST_TYPES } from "../../../../utils/toast";
import {
  Avatar,
  Button,
  Card,
  ErrorInput,
  ErrorResumeSection,
  Field,
  FieldError,
  Grid,
  HeaderActions,
  HeaderCard,
  HeaderEditIconButton,
  HeaderInfo,
  Label,
  Meta,
  Name,
  PrimaryButton,
  ProfilePageTitle,
  ResumeActions,
  ResumeButton,
  ResumeEditButton,
  ResumeInfoButton,
  ResumeInfoTooltip,
  ResumeInfoWrap,
  ResumeStatus,
  ResumeStatusButton,
  ResumeStatusGroup,
  ResumeTopRow,
  ProfileWrap,
  SectionTitle,
} from "./ProfilePanel.styles";

const getRoleLabel = (role?: AuthRole): string => {
  if (role === "hr") {
    return PROFILE_UI_TEXT.ROLE_LABELS.hr;
  }
  if (role === "interviewer") {
    return PROFILE_UI_TEXT.ROLE_LABELS.interviewer;
  }
  return PROFILE_UI_TEXT.ROLE_LABELS.candidate;
};

const toUpdatePayload = (profile: UserProfile): UpdateProfilePayload => ({
  name: profile.name ?? "",
  phone: profile.phone ?? "",
  currentLocation: profile.currentLocation ?? "",
  skills: profile.skills ?? "",
  experienceYears: typeof profile.experienceYears === "number" ? profile.experienceYears : 0,
  resumeUrl: profile.resumeUrl ?? "",
  department: profile.department ?? "",
  position: profile.position ?? "",
  techStack: profile.techStack ?? "",
  experienceLevel: profile.experienceLevel ?? "",
});

export const ProfilePanel = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const { data, isLoading, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadResume, { isLoading: isUploadingResume }] = useUploadResumeMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [resumeActionError, setResumeActionError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const profileData = data?.data;
  const [formValues, setFormValues] = useState<UpdateProfilePayload>({
    name: PROFILE_INITIAL_VALUES.UPDATE_PROFILE_PAYLOAD.name,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UpdateProfilePayload, string>>>({});

  const avatarText = useMemo(() => {
    const source = (isEditing ? formValues.name : profileData?.name) || currentUser?.name || PROFILE_INITIAL_VALUES.AVATAR_FALLBACK;
    return source.trim().slice(0, 2).toUpperCase();
  }, [currentUser?.name, formValues.name, isEditing, profileData?.name]);

  if (isLoading) {
    return <DashboardDescription>{PROFILE_DEFAULT_MESSAGES.LOADING_PROFILE}</DashboardDescription>;
  }

  if (!profileData) {
    return <DashboardDescription>{PROFILE_DEFAULT_MESSAGES.PROFILE_LOAD_FAILED}</DashboardDescription>;
  }

  const isCandidate = profileData.role === "candidate";
  const isHr = profileData.role === "hr";
  const roleTitle = isHr
    ? PROFILE_UI_TEXT.COMPLETE_HR_PROFILE
    : isCandidate
      ? PROFILE_UI_TEXT.COMPLETE_CANDIDATE_PROFILE
      : PROFILE_UI_TEXT.COMPLETE_INTERVIEWER_PROFILE;
  const viewValues = toUpdatePayload(profileData);
  const hasResume = Boolean(profileData.resumeUrl);
  const isResumeActionInProgress = isUploadingResume;

  const updateValue = <T extends keyof UpdateProfilePayload>(key: T, value: UpdateProfilePayload[T]): void => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const onCandidatePhoneChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const digitsOnlyValue = event.target.value.replace(/\D/g, "").slice(0, PROFILE_FORM_LIMITS.phoneDigits);
    updateValue("phone", digitsOnlyValue);
  };

  const parseResumeActionError = (error: unknown, fallback: string): string => {
    if (typeof error === "object" && error !== null) {
      if ("message" in error && typeof (error as { message?: unknown }).message === "string") {
        const message = String((error as { message: string }).message);
        if (message.toLowerCase().includes("network")) {
          return ERROR_MESSAGES.NETWORK_RETRY;
        }
        return message;
      }
      if ("data" in error && typeof (error as { data?: unknown }).data === "object" && (error as { data?: unknown }).data) {
        const dataMessage = (error as { data: { message?: unknown } }).data.message;
        if (typeof dataMessage === "string") {
          if (dataMessage.toLowerCase().includes("network")) {
            return ERROR_MESSAGES.NETWORK_RETRY;
          }
          return dataMessage;
        }
      }
    }
    return fallback;
  };

  const onResumeButtonClick = (): void => {
    if (!isEditing || isResumeActionInProgress) {
      return;
    }
    setResumeActionError("");
    fileInputRef.current?.click();
  };

  const onUploadResume = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    const lowerCaseFileName = selectedFile.name.toLowerCase();
    const hasAllowedExtension = PROFILE_RESUME_ACCEPTED_EXTENSIONS.some((ext) => lowerCaseFileName.endsWith(ext));
    const hasAllowedMimeType = PROFILE_RESUME_ACCEPTED_MIME_TYPES.includes(selectedFile.type as (typeof PROFILE_RESUME_ACCEPTED_MIME_TYPES)[number]);

    if (!hasAllowedExtension && !hasAllowedMimeType) {
      setResumeActionError(VALIDATION_MESSAGES.INVALID_RESUME_FILE_TYPE);
      event.target.value = "";
      return;
    }

    if (selectedFile.size > PROFILE_FORM_LIMITS.resumeMaxSizeBytes) {
      setResumeActionError(VALIDATION_MESSAGES.RESUME_FILE_TOO_LARGE);
      event.target.value = "";
      return;
    }

    try {
      setResumeActionError("");
      const response = await uploadResume({ file: selectedFile }).unwrap();
      await refetch();
      setFormValues((prev) => ({ ...prev, resumeUrl: response.data?.resumeUrl ?? prev.resumeUrl ?? "" }));
      setFormErrors((prev) => ({ ...prev, resumeUrl: "" }));
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: SUCCESS_MESSAGES.RESUME_UPLOADED,
      });
    } catch (error) {
      const message = parseResumeActionError(error, PROFILE_DEFAULT_MESSAGES.RESUME_UPLOAD_FAILED);
      setResumeActionError(message);
      showToast({
        type: TOAST_TYPES.ERROR,
        message,
      });
    } finally {
      event.target.value = "";
    }
  };

  const validateProfileForm = (): boolean => {
    const nextErrors: Partial<Record<keyof UpdateProfilePayload, string>> = {};

    if (!formValues.name?.trim()) {
      nextErrors.name = PROFILE_VALIDATION_MESSAGES.FULL_NAME_REQUIRED;
    }

    if (isCandidate) {
      const normalizedPhone = (formValues.phone ?? "").replace(/\D/g, "");
      if (!normalizedPhone) {
        nextErrors.phone = PROFILE_VALIDATION_MESSAGES.PHONE_NUMBER_REQUIRED;
      } else if (normalizedPhone.length !== PROFILE_FORM_LIMITS.phoneDigits) {
        nextErrors.phone = PROFILE_VALIDATION_MESSAGES.PHONE_NUMBER_INVALID;
      }
      if (!formValues.currentLocation?.trim()) {
        nextErrors.currentLocation = PROFILE_VALIDATION_MESSAGES.CURRENT_LOCATION_REQUIRED_PANEL;
      } else if ((formValues.currentLocation ?? "").trim().length > PROFILE_FORM_LIMITS.maxLocationLength) {
        nextErrors.currentLocation = PROFILE_VALIDATION_MESSAGES.CURRENT_LOCATION_MAX_LENGTH_PANEL(PROFILE_FORM_LIMITS.maxLocationLength);
      }
      if (!formValues.skills?.trim()) {
        nextErrors.skills = PROFILE_VALIDATION_MESSAGES.SKILLS_REQUIRED_PANEL;
      } else if ((formValues.skills ?? "").trim().length > PROFILE_FORM_LIMITS.maxSkillsLength) {
        nextErrors.skills = PROFILE_VALIDATION_MESSAGES.SKILLS_MAX_LENGTH(PROFILE_FORM_LIMITS.maxSkillsLength);
      }
      if (
        formValues.experienceYears === undefined ||
        Number.isNaN(Number(formValues.experienceYears)) ||
        Number(formValues.experienceYears) < 0 ||
        Number(formValues.experienceYears) > PROFILE_FORM_LIMITS.maxExperienceYears
      ) {
        nextErrors.experienceYears = PROFILE_VALIDATION_MESSAGES.EXPERIENCE_INVALID_PANEL(PROFILE_FORM_LIMITS.maxExperienceYears);
      }
      if (!formValues.resumeUrl?.trim()) {
        nextErrors.resumeUrl = PROFILE_VALIDATION_MESSAGES.RESUME_URL_REQUIRED;
      }
    } else if (isHr) {
      if (!formValues.position?.trim()) {
        nextErrors.position = PROFILE_VALIDATION_MESSAGES.DESIGNATION_REQUIRED;
      }
      if (!formValues.experienceLevel?.trim()) {
        nextErrors.experienceLevel = PROFILE_VALIDATION_MESSAGES.EXPERIENCE_LEVEL_REQUIRED;
      }
      if (!formValues.department?.trim()) {
        nextErrors.department = PROFILE_VALIDATION_MESSAGES.DEPARTMENT_REQUIRED;
      }
    } else {
      if (!formValues.position?.trim()) {
        nextErrors.position = PROFILE_VALIDATION_MESSAGES.DESIGNATION_REQUIRED;
      }
      if (!formValues.techStack?.trim()) {
        nextErrors.techStack = PROFILE_VALIDATION_MESSAGES.TECH_STACK_REQUIRED;
      }
      if (!formValues.experienceLevel?.trim()) {
        nextErrors.experienceLevel = PROFILE_VALIDATION_MESSAGES.EXPERIENCE_LEVEL_REQUIRED;
      }
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSave = async (): Promise<void> => {
    if (!validateProfileForm()) {
      return;
    }

    try {
      const response = await updateProfile(formValues).unwrap();
      if (response.data) {
        dispatch(setCurrentUser(response.data));
      }
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: response.message || PROFILE_DEFAULT_MESSAGES.PROFILE_UPDATED_SUCCESS,
      });
      setIsEditing(false);
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : PROFILE_DEFAULT_MESSAGES.PROFILE_UPDATE_FAILED;
      showToast({
        type: TOAST_TYPES.ERROR,
        message,
      });
    }
  };

  const onCancel = (): void => {
    setIsEditing(false);
    setFormErrors({});
    setResumeActionError("");
  };

  return (
    <ProfileWrap>
      <ProfilePageTitle>{roleTitle}</ProfilePageTitle>

      <HeaderCard>
        <Avatar>{avatarText}</Avatar>
        <HeaderInfo>
          <Name>{(isEditing ? formValues.name : profileData.name) || PROFILE_INITIAL_VALUES.DISPLAY_FALLBACK}</Name>
          <Meta>{PROFILE_UI_TEXT.ROLE_PREFIX} {getRoleLabel(profileData.role)}</Meta>
          <Meta>{PROFILE_UI_TEXT.EMAIL_PREFIX} {profileData.email}</Meta>
        </HeaderInfo>
        <HeaderActions>
          {!isEditing ? (
            <HeaderEditIconButton
              type="button"
              aria-label={PROFILE_UI_TEXT.EDIT_PROFILE_ARIA}
              title={PROFILE_UI_TEXT.EDIT_PROFILE_TITLE}
              onClick={() => {
                setFormValues(toUpdatePayload(profileData));
                setFormErrors({});
                setIsEditing(true);
              }}
            >
              <FiEdit2 />
            </HeaderEditIconButton>
          ) : (
            <>
              <Button type="button" onClick={onCancel}>
                {PROFILE_UI_TEXT.CANCEL}
              </Button>
              <PrimaryButton type="button" onClick={onSave} disabled={isUpdating}>
                {isUpdating ? PROFILE_UI_TEXT.SAVING : PROFILE_UI_TEXT.SAVE_CHANGES}
              </PrimaryButton>
            </>
          )}
        </HeaderActions>
      </HeaderCard>

      <Card>
        <SectionTitle>{PROFILE_UI_TEXT.PERSONAL_INFORMATION}</SectionTitle>
        <Grid>
          <Field>
            <Label>
              <FiUser />
              {PROFILE_UI_TEXT.FULL_NAME}
            </Label>
            <ErrorInput
              $hasError={Boolean(formErrors.name)}
              value={isEditing ? formValues.name : viewValues.name}
              readOnly={!isEditing}
              onChange={(event) => updateValue("name", event.target.value)}
              placeholder={PROFILE_UI_TEXT.FULL_NAME_PLACEHOLDER}
            />
            <FieldError>{formErrors.name || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
          </Field>
          <Field>
            <Label>
              <FiMail />
              {PROFILE_UI_TEXT.EMAIL}
            </Label>
            <ErrorInput value={profileData.email} readOnly placeholder={PROFILE_UI_TEXT.EMAIL_PLACEHOLDER} />
            <FieldError>{PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
          </Field>
          {isCandidate ? (
            <>
              <Field>
                <Label>
                  <FiPhone />
                  {PROFILE_UI_TEXT.PHONE_NUMBER}
                </Label>
                <ErrorInput
                  $hasError={Boolean(formErrors.phone)}
                  value={isEditing ? formValues.phone ?? "" : viewValues.phone ?? ""}
                  readOnly={!isEditing}
                  onChange={onCandidatePhoneChange}
                  placeholder={PROFILE_UI_TEXT.PHONE_PLACEHOLDER}
                  inputMode="numeric"
                  maxLength={PROFILE_FORM_LIMITS.phoneDigits}
                />
                <FieldError>{formErrors.phone || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
              </Field>
              <Field>
                <Label>
                  <FiMapPin />
                  {PROFILE_UI_TEXT.CURRENT_LOCATION}
                </Label>
                <ErrorInput
                  $hasError={Boolean(formErrors.currentLocation)}
                  value={isEditing ? formValues.currentLocation ?? "" : viewValues.currentLocation ?? ""}
                  readOnly={!isEditing}
                  onChange={(event) => updateValue("currentLocation", event.target.value)}
                  placeholder={PROFILE_UI_TEXT.CURRENT_LOCATION_PLACEHOLDER}
                />
                <FieldError>{formErrors.currentLocation || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
              </Field>
            </>
          ) : null}
        </Grid>
      </Card>

      <Card>
        <SectionTitle>{PROFILE_UI_TEXT.PROFESSIONAL_INFORMATION}</SectionTitle>
        <Grid>
          {isCandidate ? (
            <>
              <Field>
                <Label>
                  <FiTool />
                  {PROFILE_UI_TEXT.SKILLS}
                </Label>
                <ErrorInput
                  $hasError={Boolean(formErrors.skills)}
                  value={isEditing ? formValues.skills ?? "" : viewValues.skills ?? ""}
                  readOnly={!isEditing}
                  onChange={(event) => updateValue("skills", event.target.value)}
                  placeholder={PROFILE_UI_TEXT.SKILLS_PLACEHOLDER}
                />
                <FieldError>{formErrors.skills || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
              </Field>
              <Field>
                <Label>
                  <FiBriefcase />
                  {PROFILE_UI_TEXT.EXPERIENCE}
                </Label>
                <ErrorInput
                  $hasError={Boolean(formErrors.experienceYears)}
                  type="number"
                  min={0}
                  value={
                    isEditing
                      ? typeof formValues.experienceYears === "number"
                        ? formValues.experienceYears
                        : 0
                      : typeof viewValues.experienceYears === "number"
                        ? viewValues.experienceYears
                        : 0
                  }
                  readOnly={!isEditing}
                  onChange={(event) => updateValue("experienceYears", Number(event.target.value))}
                  placeholder={PROFILE_UI_TEXT.EXPERIENCE_YEARS_PLACEHOLDER}
                />
                <FieldError>{formErrors.experienceYears || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
              </Field>
              <Field>
                <Label>
                  {PROFILE_UI_TEXT.RESUME}
                  <ResumeInfoWrap>
                    <ResumeInfoButton type="button" aria-label={PROFILE_UI_TEXT.RESUME_INFO_ARIA}>
                      <FiInfo />
                    </ResumeInfoButton>
                    <ResumeInfoTooltip>{PROFILE_UI_TEXT.RESUME_UPLOAD_INFO}</ResumeInfoTooltip>
                  </ResumeInfoWrap>
                </Label>
                <ErrorResumeSection $hasError={Boolean(resumeActionError || formErrors.resumeUrl)}>
                  <ResumeTopRow>
                    <ResumeStatusGroup>
                      {hasResume ? (
                        <ResumeStatusButton
                          type="button"
                          onClick={() => window.open(profileData.resumeUrl, "_blank", "noopener,noreferrer")}
                          disabled={isResumeActionInProgress}
                          aria-label={PROFILE_UI_TEXT.OPEN_RESUME_ARIA}
                        >
                          <FiCheckCircle />
                          {PROFILE_UI_TEXT.RESUME_UPLOADED}
                        </ResumeStatusButton>
                      ) : (
                        <ResumeStatus>
                          <FiCheckCircle />
                          {PROFILE_UI_TEXT.NO_RESUME}
                        </ResumeStatus>
                      )}
                    </ResumeStatusGroup>
                    {hasResume ? (
                      <ResumeEditButton
                        type="button"
                        onClick={onResumeButtonClick}
                        disabled={!isEditing || isResumeActionInProgress}
                        aria-label={PROFILE_UI_TEXT.REPLACE_RESUME}
                        title={PROFILE_UI_TEXT.REPLACE_RESUME}
                      >
                        <FiEdit2 />
                      </ResumeEditButton>
                    ) : null}
                  </ResumeTopRow>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    style={{ display: "none" }}
                    onChange={onUploadResume}
                    disabled={!isEditing || isResumeActionInProgress}
                  />
                  {!hasResume ? (
                    <ResumeActions>
                      <ResumeButton
                        type="button"
                        onClick={onResumeButtonClick}
                        disabled={!isEditing || isResumeActionInProgress}
                      >
                        {isUploadingResume ? PROFILE_UI_TEXT.UPLOADING : PROFILE_UI_TEXT.UPLOAD_RESUME}
                      </ResumeButton>
                    </ResumeActions>
                  ) : null}
                  <FieldError>{resumeActionError || formErrors.resumeUrl || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
                </ErrorResumeSection>
              </Field>
            </>
          ) : (
            <>
              <Field>
                <Label>
                  <FiUserCheck />
                  {PROFILE_UI_TEXT.DESIGNATION}
                </Label>
                <ErrorInput
                  $hasError={Boolean(formErrors.position)}
                  value={isEditing ? formValues.position ?? "" : viewValues.position ?? ""}
                  readOnly={!isEditing}
                  onChange={(event) => updateValue("position", event.target.value)}
                  placeholder={PROFILE_UI_TEXT.DESIGNATION_PLACEHOLDER}
                />
                <FieldError>{formErrors.position || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
              </Field>
              {isHr ? (
                <Field>
                  <Label>
                    <FiBriefcase />
                    {PROFILE_UI_TEXT.DEPARTMENT}
                  </Label>
                  <ErrorInput
                    $hasError={Boolean(formErrors.department)}
                    value={isEditing ? formValues.department ?? "" : viewValues.department ?? ""}
                    readOnly={!isEditing}
                    onChange={(event) => updateValue("department", event.target.value)}
                    placeholder={PROFILE_UI_TEXT.DEPARTMENT_INPUT_PLACEHOLDER}
                  />
                  <FieldError>{formErrors.department || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
                </Field>
              ) : null}
              <Field>
                <Label>
                  <FiTool />
                  {isHr ? PROFILE_UI_TEXT.EXPERIENCE_LEVEL : PROFILE_UI_TEXT.TECH_STACK}
                </Label>
                <ErrorInput
                  $hasError={Boolean(isHr ? formErrors.experienceLevel : formErrors.techStack)}
                  value={
                    isHr
                      ? isEditing
                        ? formValues.experienceLevel ?? ""
                        : viewValues.experienceLevel ?? ""
                      : isEditing
                        ? formValues.techStack ?? ""
                        : viewValues.techStack ?? ""
                  }
                  readOnly={!isEditing}
                  onChange={(event) =>
                    isHr ? updateValue("experienceLevel", event.target.value) : updateValue("techStack", event.target.value)
                  }
                  placeholder={isHr ? PROFILE_UI_TEXT.EXPERIENCE_LEVEL_PLACEHOLDER : PROFILE_UI_TEXT.TECH_STACK_INPUT_PLACEHOLDER}
                />
                <FieldError>
                  {isHr
                    ? formErrors.experienceLevel || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER
                    : formErrors.techStack || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}
                </FieldError>
              </Field>
              {!isHr ? (
                <Field>
                  <Label>
                    <FiBriefcase />
                    {PROFILE_UI_TEXT.EXPERIENCE_LEVEL}
                  </Label>
                  <ErrorInput
                    $hasError={Boolean(formErrors.experienceLevel)}
                    value={isEditing ? formValues.experienceLevel ?? "" : viewValues.experienceLevel ?? ""}
                    readOnly={!isEditing}
                    onChange={(event) => updateValue("experienceLevel", event.target.value)}
                    placeholder={PROFILE_UI_TEXT.EXPERIENCE_LEVEL_PLACEHOLDER}
                  />
                  <FieldError>{formErrors.experienceLevel || PROFILE_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</FieldError>
                </Field>
              ) : null}
            </>
          )}
        </Grid>
      </Card>
    </ProfileWrap>
  );
};
