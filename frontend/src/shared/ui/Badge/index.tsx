import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

type BadgeTone = 'active' | 'inactive' | 'info' | 'success' | 'danger' | 'purple';

const toneStyles = {
  active: css`
    border-color: ${theme.colors.successBorder};
    color: ${theme.colors.success};
    background: ${theme.colors.successBackground};
  `,
  inactive: css`
    border-color: ${theme.colors.infoBorder};
    color: #566a86;
    background: ${theme.colors.infoBackground};
  `,
  info: css`
    border-color: ${theme.colors.infoBorder};
    color: ${theme.colors.info};
    background: ${theme.colors.infoBackground};
  `,
  success: css`
    border-color: ${theme.colors.successBorder};
    color: ${theme.colors.success};
    background: ${theme.colors.successBackground};
  `,
  danger: css`
    border-color: ${theme.colors.dangerBorder};
    color: ${theme.colors.danger};
    background: ${theme.colors.dangerBackground};
  `,
  purple: css`
    border-color: ${theme.colors.purpleBorder};
    color: ${theme.colors.purple};
    background: ${theme.colors.purpleBackground};
  `,
};

export const Badge = styled.span<{ $tone?: BadgeTone }>`
  border: 1px solid;
  border-radius: ${theme.radius.pill};
  padding: 0.2rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
  ${({ $tone = 'info' }) => toneStyles[$tone]}
`;
