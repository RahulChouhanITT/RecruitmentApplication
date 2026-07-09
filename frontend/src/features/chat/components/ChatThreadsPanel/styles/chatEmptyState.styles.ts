import styled from 'styled-components';
import { chatPanelHeight } from './chatShared.styles';

export const StartChatButton = styled.button`
  margin-top: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: 0.7rem 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.card};

  &:disabled {
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.borderStrong};
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }
`;

export const EmptyStateWrap = styled.div`
  min-height: ${chatPanelHeight};
  display: grid;
  align-content: center;
  justify-items: start;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  background:
    radial-gradient(circle at top, rgba(235, 243, 255, 0.45), transparent 32%),
    ${({ theme }) => theme.colors.white};
`;
