import type { InputHTMLAttributes } from "react";
import { FaInfoCircle } from "react-icons/fa";
import {
  ErrorText,
  InfoButton,
  InfoHint,
  InfoWrapper,
  InputGroup,
  InputLabel,
  LabelRow,
  StyledInput,
} from "./Input.styles";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hasError?: boolean;
  errorMessage?: string;
  infoMessage?: string;
};

export const Input = ({ label, id, hasError, errorMessage, infoMessage, ...inputProps }: InputProps) => {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <InputGroup>
      <LabelRow>
        <InputLabel htmlFor={inputId}>{label}</InputLabel>
        {infoMessage ? (
          <InfoWrapper>
            <InfoButton type="button" aria-label={`${label} info`}>
              <FaInfoCircle size={13} />
            </InfoButton>
            <InfoHint>{infoMessage}</InfoHint>
          </InfoWrapper>
        ) : null}
      </LabelRow>
      <StyledInput id={inputId} $hasError={hasError} {...inputProps} />
      <ErrorText $visible={Boolean(errorMessage)}>{errorMessage || "\u00A0"}</ErrorText>
    </InputGroup>
  );
};
