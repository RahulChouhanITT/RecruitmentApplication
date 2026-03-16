import { useMemo, useState } from "react";
import { INTERVIEWER_INITIAL_VALUES, INTERVIEWER_STATUS_VALUES } from "../../constants/interviewerConstants";
import {
  INTERVIEWER_UI_TEXT,
  INTERVIEWER_VALIDATION_MESSAGES,
} from "../../labels/interviewerLabels";
import {
  Actions,
  Card,
  ErrorText,
  GhostButton,
  Grid,
  Label,
  Overlay,
  PrimaryButton,
  Select,
  Textarea,
  Title,
} from "./InterviewFeedbackModal.styles";

type InterviewFeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { rating: number; comments?: string; recommendation: "HIRED" | "REJECTED" }) => Promise<void>;
  isSubmitting?: boolean;
};

export const InterviewFeedbackModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: InterviewFeedbackModalProps) => {
  const [rating, setRating] = useState<string>(INTERVIEWER_INITIAL_VALUES.FEEDBACK_FORM.rating);
  const [recommendation, setRecommendation] = useState<"" | "HIRED" | "REJECTED">(
    INTERVIEWER_INITIAL_VALUES.FEEDBACK_FORM.recommendation as "" | "HIRED" | "REJECTED"
  );
  const [comments, setComments] = useState<string>(INTERVIEWER_INITIAL_VALUES.FEEDBACK_FORM.comments);
  const [errors, setErrors] = useState<{ rating?: string; recommendation?: string }>({});

  const canRender = useMemo(() => isOpen, [isOpen]);
  if (!canRender) {
    return null;
  }

  const validate = (): boolean => {
    const nextErrors: { rating?: string; recommendation?: string } = {};

    if (!rating.trim()) {
      nextErrors.rating = INTERVIEWER_VALIDATION_MESSAGES.RATING_REQUIRED;
    }

    if (!recommendation) {
      nextErrors.recommendation = INTERVIEWER_VALIDATION_MESSAGES.RECOMMENDATION_REQUIRED;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) {
      return;
    }

    await onSubmit({
      rating: Number(rating),
      recommendation: recommendation as "HIRED" | "REJECTED",
      comments: comments.trim(),
    });

    setRating(INTERVIEWER_INITIAL_VALUES.FEEDBACK_FORM.rating);
    setRecommendation(INTERVIEWER_INITIAL_VALUES.FEEDBACK_FORM.recommendation as "" | "HIRED" | "REJECTED");
    setComments(INTERVIEWER_INITIAL_VALUES.FEEDBACK_FORM.comments);
    setErrors({});
  };

  return (
    <Overlay>
      <Card>
        <Title>{INTERVIEWER_UI_TEXT.FEEDBACK_MODAL_TITLE}</Title>
        <Grid>
          <Label>
            {INTERVIEWER_UI_TEXT.RATING_LABEL}
            <Select
              value={rating}
              onChange={(event) => {
                setRating(event.target.value);
                setErrors((prev) => ({ ...prev, rating: INTERVIEWER_INITIAL_VALUES.EMPTY_STRING }));
              }}
            >
              <option value={INTERVIEWER_INITIAL_VALUES.EMPTY_STRING}>{INTERVIEWER_UI_TEXT.RATING_PLACEHOLDER}</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
            <ErrorText>{errors.rating || INTERVIEWER_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</ErrorText>
          </Label>

          <Label>
            {INTERVIEWER_UI_TEXT.RECOMMENDATION_LABEL}
            <Select
              value={recommendation}
              onChange={(event) => {
                setRecommendation(event.target.value as "" | "HIRED" | "REJECTED");
                setErrors((prev) => ({ ...prev, recommendation: INTERVIEWER_INITIAL_VALUES.EMPTY_STRING }));
              }}
            >
              <option value={INTERVIEWER_INITIAL_VALUES.EMPTY_STRING}>{INTERVIEWER_UI_TEXT.RECOMMENDATION_PLACEHOLDER}</option>
              <option value={INTERVIEWER_STATUS_VALUES.HIRED}>{INTERVIEWER_UI_TEXT.RECOMMENDATION_HIRED}</option>
              <option value={INTERVIEWER_STATUS_VALUES.REJECTED}>{INTERVIEWER_UI_TEXT.RECOMMENDATION_REJECTED}</option>
            </Select>
            <ErrorText>{errors.recommendation || INTERVIEWER_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</ErrorText>
          </Label>

          <Label>
            {INTERVIEWER_UI_TEXT.COMMENTS_LABEL}
            <Textarea
              placeholder={INTERVIEWER_UI_TEXT.COMMENTS_PLACEHOLDER}
              value={comments}
              onChange={(event) => setComments(event.target.value)}
            />
            <ErrorText>{INTERVIEWER_UI_TEXT.FIELD_ERROR_PLACEHOLDER}</ErrorText>
          </Label>
        </Grid>

        <Actions>
          <GhostButton type="button" onClick={onClose}>
            {INTERVIEWER_UI_TEXT.CANCEL}
          </GhostButton>
          <PrimaryButton type="button" disabled={isSubmitting} onClick={() => void handleSubmit()}>
            {isSubmitting ? INTERVIEWER_UI_TEXT.SUBMITTING : INTERVIEWER_UI_TEXT.FEEDBACK_MODAL_TITLE}
          </PrimaryButton>
        </Actions>
      </Card>
    </Overlay>
  );
};
