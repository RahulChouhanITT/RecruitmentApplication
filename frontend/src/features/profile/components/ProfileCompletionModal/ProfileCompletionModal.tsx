import { useMemo, useState } from "react";
import type { AuthRole, CompleteProfilePayload } from "../../../auth/types";
import {
  Actions,
  Button,
  Card,
  ErrorText,
  Field,
  Input,
  Overlay,
  PrimaryButton,
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

const initialPayload: CompleteProfilePayload = {
  phone: "",
  resumeUrl: "",
  skills: "",
  experienceYears: 0,
  currentLocation: "",
  position: "",
  experienceLevel: "",
  department: "",
  techStack: "",
};

export const ProfileCompletionModal = ({
  isOpen,
  role,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: ProfileCompletionModalProps) => {
  const [formValues, setFormValues] = useState<CompleteProfilePayload>(initialPayload);
  const [error, setError] = useState<string>("");

  const isCandidate = role === "candidate";
  const isHr = role === "hr";
  const isInterviewer = role === "interviewer";

  const title = useMemo(() => {
    if (isHr) {
      return "Complete HR Profile";
    }
    if (isInterviewer) {
      return "Complete Interviewer Profile";
    }
    return "Complete Candidate Profile";
  }, [isHr, isInterviewer]);

  const updateValue = (key: keyof CompleteProfilePayload, value: string | number): void => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const validate = (): boolean => {
    if (isCandidate) {
      if (
        !formValues.phone?.trim() ||
        !formValues.resumeUrl?.trim() ||
        !formValues.skills?.trim() ||
        formValues.experienceYears === undefined ||
        Number(formValues.experienceYears) < 0 ||
        !formValues.currentLocation?.trim()
      ) {
        setError("Please fill all candidate profile fields.");
        return false;
      }
    }

    if (isHr) {
      if (!formValues.position?.trim() || !formValues.experienceLevel?.trim() || !formValues.department?.trim()) {
        setError("Please fill all HR profile fields.");
        return false;
      }
    }

    if (isInterviewer) {
      if (!formValues.position?.trim() || !formValues.techStack?.trim() || !formValues.experienceLevel?.trim()) {
        setError("Please fill all interviewer profile fields.");
        return false;
      }
    }

    return true;
  };

  const onFormSubmit = async (): Promise<void> => {
    if (!validate()) {
      return;
    }

    await onSubmit(formValues);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Overlay>
      <Card>
        <Title>{title}</Title>

        {isCandidate ? (
          <Row>
            <Field>
              <span>Phone</span>
              <Input value={formValues.phone ?? ""} onChange={(e) => updateValue("phone", e.target.value)} />
            </Field>
            <Field>
              <span>Resume URL</span>
              <Input value={formValues.resumeUrl ?? ""} onChange={(e) => updateValue("resumeUrl", e.target.value)} />
            </Field>
            <Field>
              <span>Skills</span>
              <Input value={formValues.skills ?? ""} onChange={(e) => updateValue("skills", e.target.value)} />
            </Field>
            <Field>
              <span>Experience Years</span>
              <Input
                type="number"
                min={0}
                value={formValues.experienceYears ?? 0}
                onChange={(e) => updateValue("experienceYears", Number(e.target.value))}
              />
            </Field>
            <Field>
              <span>Current Location</span>
              <Input
                value={formValues.currentLocation ?? ""}
                onChange={(e) => updateValue("currentLocation", e.target.value)}
              />
            </Field>
          </Row>
        ) : null}

        {isHr ? (
          <Row>
            <Field>
              <span>Position</span>
              <Input value={formValues.position ?? ""} onChange={(e) => updateValue("position", e.target.value)} />
            </Field>
            <Field>
              <span>Experience Level</span>
              <Input
                value={formValues.experienceLevel ?? ""}
                onChange={(e) => updateValue("experienceLevel", e.target.value)}
              />
            </Field>
            <Field>
              <span>Department</span>
              <Input value={formValues.department ?? ""} onChange={(e) => updateValue("department", e.target.value)} />
            </Field>
          </Row>
        ) : null}

        {isInterviewer ? (
          <Row>
            <Field>
              <span>Position</span>
              <Input value={formValues.position ?? ""} onChange={(e) => updateValue("position", e.target.value)} />
            </Field>
            <Field>
              <span>Tech Stack</span>
              <Input value={formValues.techStack ?? ""} onChange={(e) => updateValue("techStack", e.target.value)} />
            </Field>
            <Field>
              <span>Experience Level</span>
              <Input
                value={formValues.experienceLevel ?? ""}
                onChange={(e) => updateValue("experienceLevel", e.target.value)}
              />
            </Field>
          </Row>
        ) : null}

        {error ? <ErrorText>{error}</ErrorText> : null}

        <Actions>
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
          <PrimaryButton type="button" disabled={isSubmitting} onClick={onFormSubmit}>
            {isSubmitting ? "Saving..." : "Save Profile"}
          </PrimaryButton>
        </Actions>
      </Card>
    </Overlay>
  );
};
