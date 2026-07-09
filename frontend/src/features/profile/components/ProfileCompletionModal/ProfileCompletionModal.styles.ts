import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.overlay};
  padding: 1rem;
`;

export const Card = styled.div`
  width: min(38rem, 100%);
  border-radius: 0.875rem;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  box-shadow: ${({ theme }) => theme.shadows.modal};
  padding: 1.1rem 1.1rem 0.9rem;
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Description = styled.p`
  margin: 0.45rem 0 0;
  color: ${({ theme }) => theme.colors.textTertiary};
  font-size: 0.82rem;
  line-height: 1.35;
`;

export const Row = styled.div`
  margin-top: 0.8rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
  align-items: start;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.label`
  display: grid;
  gap: 0.32rem;
`;

export const LabelRow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;

  svg {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

export const RequiredMark = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 700;
  line-height: 1;
`;

export const Input = styled.input`
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 0.5rem;
  padding: 0.5rem 0.62rem;
  font-size: 0.86rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.inputFocus};
    box-shadow: 0 0 0 2px rgba(47, 111, 214, 0.15);
  }
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const ResumeCard = styled.div`
  border: 1px dashed ${({ theme }) => theme.colors.inputBorder};
  border-radius: 0.5rem;
  background: ${({ theme }) => theme.colors.panelBg};
  padding: 0.75rem 0.85rem;
  display: grid;
  gap: 0.5rem;
  max-width: 100%;
  overflow: hidden;
`;

export const ResumeHeaderRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 1.75rem;
`;

export const ResumeUploadedRow = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  color: ${({ theme }) => theme.colors.inputFocus};
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;

  svg {
    color: ${({ theme }) => theme.colors.success};
    font-size: 0.88rem;
    transform: translateY(1px);
  }
`;

export const ResumeUploadedLink = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  color: ${({ theme }) => theme.colors.inputFocus};
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;
  text-align: left;

  &:hover {
    text-decoration: underline;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.75;
    text-decoration: none;
  }

  svg {
    font-size: 0.88rem;
    transform: translateY(1px);
  }
`;

export const ResumeIconButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.textTertiary};
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.inputFocus};
    border-color: ${({ theme }) => theme.colors.primaryBorder};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.75;
  }
`;

export const ResumeInfoWrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 0.08rem;
`;

export const ResumeInfoButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textTertiary};
  width: auto;
  height: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  line-height: 1;

  svg {
    font-size: 0.95rem;
  }

  &:hover + span,
  &:focus-visible + span {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

export const ResumeInfoTooltip = styled.span`
  position: absolute;
  right: 0;
  top: calc(100% + 0.35rem);
  z-index: 3;
  width: max-content;
  max-width: 16rem;
  border-radius: 0.45rem;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: 0.42rem 0.5rem;
  font-size: 0.74rem;
  line-height: 1.3;
  box-shadow: ${({ theme }) => theme.shadows.floating};
  opacity: 0;
  visibility: hidden;
  transform: translateY(-2px);
  transition:
    opacity 0.14s ease,
    transform 0.14s ease,
    visibility 0.14s ease;
  pointer-events: none;
`;

export const ResumeActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`;

export const ResumeButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.inputFocus};
  background: ${({ theme }) => theme.colors.inputFocus};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 0.45rem;
  padding: 0.45rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.75;
  }
`;

export const ResumeGhostButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.inputFocus};
  border-radius: 0.45rem;
  padding: 0.45rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.75;
  }
`;

export const ResumeLinkButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0;
  margin: 0.1rem 0 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  width: fit-content;

  &:hover {
    text-decoration: underline;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.75;
    text-decoration: none;
  }
`;

export const FieldError = styled.span`
  min-height: 1rem;
  color: ${({ theme }) => theme.colors.danger} !important;
  font-size: 0.76rem;
  line-height: 1.2;
  font-weight: 400;
  font-family: inherit;
  display: block;
`;

export const Actions = styled.div`
  margin-top: 0.95rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
`;

export const Button = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.inputFocus};
  border-radius: 0.5rem;
  padding: 0.55rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
`;

export const PrimaryButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.inputFocus};
  background: ${({ theme }) => theme.colors.inputFocus};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 0.5rem;
  padding: 0.55rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
