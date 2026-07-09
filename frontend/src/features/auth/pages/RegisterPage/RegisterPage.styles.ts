import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const PageContent = styled.div`
  width: 100%;
`;

export const AuthSwitchText = styled.p`
  margin-top: 0.5rem;
  margin-bottom: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
`;

export const AuthSwitchLink = styled(Link)`
  color: ${({ theme }) => theme.colors.inputFocus};
  text-decoration: none;
  font-weight: 600;
`;

export const AuthMessage = styled.p<{ $type: 'error' | 'success' }>`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme, $type }) => ($type === 'error' ? theme.colors.danger : theme.colors.success)};
  text-align: center;
`;

export const AuthDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0 0.25rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;
