import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const PageContent = styled.div`
  width: 100%;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const HelperText = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  width: 100%;
`;

export const ResendRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.15rem;
`;

export const ResendButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.inputFocus};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;

  &:disabled {
    color: ${({ theme }) => theme.colors.primaryBorder};
    cursor: not-allowed;
  }
`;

export const BottomMessage = styled.p`
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
`;

export const BackLink = styled(Link)`
  color: ${({ theme }) => theme.colors.inputFocus};
  text-decoration: none;
  font-weight: 600;
`;
