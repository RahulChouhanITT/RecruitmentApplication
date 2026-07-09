import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

type ButtonVariant = 'primary' | 'ghost';

export const Button = styled.button<{ $variant?: ButtonVariant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: ${theme.radius.sm};
  padding: 0.45rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;

  ${({ $variant = 'primary' }) =>
    $variant === 'ghost'
      ? css`
          border: 1px solid ${theme.colors.borderStrong};
          background: ${theme.colors.white};
          color: #2d3f5f;
        `
      : css`
          border: 1px solid ${theme.colors.primary};
          background: ${theme.colors.primary};
          color: ${theme.colors.white};
        `}

  &:hover:not(:disabled) {
    ${({ $variant = 'primary' }) =>
      $variant === 'ghost'
        ? css`
            border-color: ${theme.colors.primaryBorder};
            color: ${theme.colors.primary};
          `
        : css`
            background: ${theme.colors.primaryHover};
            border-color: ${theme.colors.primaryHover};
          `}
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
