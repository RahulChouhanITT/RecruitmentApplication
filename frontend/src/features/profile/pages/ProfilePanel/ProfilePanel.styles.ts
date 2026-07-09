import styled from 'styled-components';

export const ProfileWrap = styled.section`
  display: grid;
  gap: 1rem;
`;

export const ProfilePageTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Card = styled.section`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderMuted};
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

export const HeaderCard = styled(Card)`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.borderMuted};
  color: ${({ theme }) => theme.colors.textPrimary};
  display: grid;
  place-items: center;
  font-size: 1rem;
  font-weight: 700;
`;

export const HeaderInfo = styled.div`
  min-width: 0;
  display: grid;
  gap: 0.2rem;
`;

export const Name = styled.h3`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Meta = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  justify-content: flex-end;
`;

export const Button = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.textPrimary};
  border-radius: 0.7rem;
  padding: 0.58rem 0.95rem;
  font-weight: 600;
  cursor: pointer;
`;

export const PrimaryButton = styled(Button)`
  border-color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
`;

export const HeaderEditIconButton = styled.button`
  width: 2.2rem;
  height: 2.2rem;
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.textPrimary};
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const SectionTitle = styled.h4`
  margin: 0 0 0.9rem;
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.label`
  display: grid;
  gap: 0.35rem;
`;

export const Label = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ErrorInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid
    ${({ theme, $hasError }) => ($hasError ? theme.colors.danger : theme.colors.inputBorder)};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.textPrimary};
  border-radius: 0.8rem;
  padding: 0.75rem 0.9rem;
  font-size: 0.92rem;
  outline: none;

  &[readonly] {
    background: ${({ theme }) => theme.colors.hoverBg};
  }
`;

export const FieldError = styled.span`
  min-height: 1rem;
  font-size: 0.74rem;
  color: ${({ theme }) => theme.colors.danger};
`;

export const ResumeInfoWrap = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

export const ResumeInfoButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const ResumeInfoTooltip = styled.span`
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  min-width: 220px;
  max-width: 280px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 0.6rem;
  padding: 0.5rem 0.65rem;
  font-size: 0.72rem;
  line-height: 1.35;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;

  ${ResumeInfoWrap}:hover & {
    opacity: 1;
  }
`;

export const ErrorResumeSection = styled.div<{ $hasError?: boolean }>`
  border: 1px solid
    ${({ theme, $hasError }) => ($hasError ? theme.colors.danger : theme.colors.inputBorder)};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 0.8rem;
  padding: 0.8rem 0.9rem;
  display: grid;
  gap: 0.7rem;
`;

export const ResumeTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

export const ResumeStatusGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
`;

export const ResumeStatus = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
  font-weight: 600;
`;

export const ResumeStatusButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.inputFocus};
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
`;

export const ResumeEditButton = styled.button`
  width: 2rem;
  height: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.textPrimary};
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const ResumeActions = styled.div`
  display: flex;
  justify-content: flex-start;
`;

export const ResumeButton = styled(Button)`
  border-color: ${({ theme }) => theme.colors.inputFocus};
  background: ${({ theme }) => theme.colors.inputFocus};
  color: ${({ theme }) => theme.colors.white};

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

export const ResumeStatusGroupButton = styled.div``;
