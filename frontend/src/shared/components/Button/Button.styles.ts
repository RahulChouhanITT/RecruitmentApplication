import styled from 'styled-components';

export const StyledButton = styled.button`
  width: 100%;
  min-height: 2.75rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 6px -1px rgba(79, 70, 229, 0.2),
    0 2px 4px -2px rgba(79, 70, 229, 0.2);

  &:hover {
    transform: translateY(-1px);
    box-shadow:
      0 10px 15px -3px rgba(79, 70, 229, 0.3),
      0 4px 6px -4px rgba(79, 70, 229, 0.3);
    background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px -1px rgba(79, 70, 229, 0.2);
  }

  &:disabled {
    cursor: not-allowed;
    background: #9ca3af;
    box-shadow: none;
    transform: none;
    opacity: 0.7;
  }
`;

export const ButtonContent = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

export const Spinner = styled.span`
  width: 0.95rem;
  height: 0.95rem;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: #ffffff;
  animation: spin 0.75s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
