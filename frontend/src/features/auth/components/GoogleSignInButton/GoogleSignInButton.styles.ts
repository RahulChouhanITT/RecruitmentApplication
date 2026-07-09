import styled from 'styled-components';

export const GoogleButton = styled.button`
  width: 100%;
  min-height: 2.75rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #ffffff;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.colors.inputFocus};
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  }
`;

export const GoogleButtonContent = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
`;
