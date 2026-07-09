import styled from 'styled-components';

export const Composer = styled.form`
  padding: 0.95rem 1.1rem 1.1rem;
  border-top: 1px solid var(--chat-border);
  background: ${({ theme }) => theme.colors.white};
  display: grid;
  gap: 0.55rem;
`;

export const ComposerBox = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.45rem;
  padding: 0.58rem 0.58rem 0.58rem 0.9rem;
  min-height: 58px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

export const ComposerInput = styled.textarea`
  border: none;
  padding: 0.35rem 0.1rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  resize: none;
  min-height: 42px;
  max-height: 130px;
  background: transparent;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const ComposerButton = styled.button`
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: ${({ theme }) => theme.radius.pill};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.borderStrong};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;
