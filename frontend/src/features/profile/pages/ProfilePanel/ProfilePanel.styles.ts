import styled from "styled-components";

export const ProfileWrap = styled.div`
  display: grid;
  gap: 1rem;
`;

export const ProfilePageTitle = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  color: #10203a;
  font-weight: 700;
`;

export const Card = styled.section`
  border: 1px solid #dbe3ee;
  border-radius: 0.75rem;
  background: #ffffff;
  padding: 1.25rem;
  box-shadow: 0 8px 20px rgba(16, 32, 58, 0.06);
`;

export const HeaderCard = styled(Card)`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: center;

  @media (max-width: 700px) {
    grid-template-columns: auto 1fr;
  }
`;

export const Avatar = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 999px;
  background: #2f6fd6;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
`;

export const HeaderInfo = styled.div`
  display: grid;
  gap: 0.35rem;
`;

export const Name = styled.h3`
  margin: 0;
  color: #10203a;
  font-size: 1.05rem;
`;

export const Meta = styled.span`
  color: #4f627f;
  font-size: 0.84rem;
`;

export const SectionTitle = styled.h4`
  margin: 0 0 1rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid #e7eef9;
  font-size: 0.98rem;
  color: #1f2f4d;
  font-weight: 600;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.label`
  display: grid;
  gap: 0.4rem;
`;

export const Label = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  font-size: 0.78rem;
  color: #4f627f;
  font-weight: 600;

  svg {
    font-size: 0.85rem;
    color: #6c80a3;
  }
`;

export const Input = styled.input`
  min-height: 2.5rem;
  border: 1px solid #ced8ea;
  border-radius: 0.5rem;
  background: #ffffff;
  padding: 0.5rem 0.75rem;
  color: #1f2f4d;
  font-size: 0.88rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    border-color: #2f6fd6;
    box-shadow: 0 0 0 2px rgba(47, 111, 214, 0.14);
    outline: none;
  }

  &:read-only {
    background: #f8faff;
    color: #425778;
  }
`;

export const ErrorInput = styled(Input)<{ $hasError?: boolean }>`
  border-color: ${({ $hasError }) => ($hasError ? "#b42318" : "#ced8ea")};

  &:focus {
    border-color: ${({ $hasError }) => ($hasError ? "#b42318" : "#2f6fd6")};
    box-shadow: ${({ $hasError }) =>
      $hasError ? "0 0 0 2px rgba(180, 35, 24, 0.15)" : "0 0 0 2px rgba(47, 111, 214, 0.14)"};
  }
`;

export const FieldError = styled.span`
  min-height: 1rem;
  font-size: 0.76rem;
  color: #b42318;
  line-height: 1.2;
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  @media (max-width: 700px) {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
`;

export const HeaderEditIconButton = styled.button`
  border: 1px solid #c8d3e7;
  background: #ffffff;
  color: #4f627f;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    color: #224b97;
    border-color: #aec3e4;
  }

  &:focus-visible {
    outline: 2px solid rgba(47, 111, 214, 0.22);
    outline-offset: 2px;
  }
`;

export const ResumeSection = styled.div`
  border: 1px dashed #c6d4ea;
  border-radius: 0.6rem;
  background: #f8fbff;
  padding: 0.75rem;
  display: grid;
  gap: 0.5rem;
`;

export const ErrorResumeSection = styled(ResumeSection)<{ $hasError?: boolean }>`
  border-color: ${({ $hasError }) => ($hasError ? "#b42318" : "#c6d4ea")};
`;

export const ResumeTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

export const ResumeStatusGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
`;

export const ResumeStatus = styled.p`
  margin: 0;
  color: #2d496f;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
`;

export const ResumeStatusButton = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  color: #1d4fa8;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: #123d88;
  }

  &:focus-visible {
    outline: 2px solid rgba(47, 111, 214, 0.28);
    outline-offset: 2px;
    border-radius: 0.2rem;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.75;
    text-decoration: none;
  }
`;

export const ResumeHint = styled.p`
  margin: 0;
  color: #5a6f8b;
  font-size: 0.77rem;
`;

export const ResumeInfoWrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

export const ResumeInfoButton = styled.button`
  border: none;
  background: transparent;
  color: #5b6f8e;
  padding: 0;
  margin: 0;
  display: inline-flex;
  align-items: center;
  cursor: pointer;

  &:hover + span,
  &:focus-visible + span {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

export const ResumeInfoTooltip = styled.span`
  position: absolute;
  left: 0;
  top: calc(100% + 0.3rem);
  z-index: 3;
  width: max-content;
  max-width: 16rem;
  border-radius: 0.45rem;
  background: #102a52;
  color: #ffffff;
  padding: 0.42rem 0.5rem;
  font-size: 0.74rem;
  line-height: 1.3;
  box-shadow: 0 0.45rem 1rem rgba(16, 42, 82, 0.2);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-2px);
  transition: opacity 0.14s ease, transform 0.14s ease, visibility 0.14s ease;
  pointer-events: none;
`;

export const ResumeEditButton = styled.button`
  border: 1px solid #c8d3e7;
  background: #ffffff;
  color: #4f627f;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    color: #224b97;
    border-color: #aec3e4;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.75;
  }
`;

export const ResumeActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const ResumeButton = styled.button`
  border: 1px solid #1d4fa8;
  background: #2f6fd6;
  color: #fff;
  border-radius: 0.5rem;
  padding: 0.42rem 0.78rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }
`;

export const ResumeGhostButton = styled.button`
  border: 1px solid #d3dbea;
  background: #fff;
  color: #2d3f5f;
  border-radius: 0.5rem;
  padding: 0.42rem 0.78rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }
`;

export const Button = styled.button`
  border: 1px solid #d3dbea;
  background: #fff;
  color: #2d3f5f;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const PrimaryButton = styled(Button)`
  border-color: #1d4fa8;
  background: #2f6fd6;
  color: #fff;
`;
