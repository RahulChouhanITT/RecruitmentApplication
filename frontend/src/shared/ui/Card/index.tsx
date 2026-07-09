import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

const cardMotion = css`
  @keyframes fadeUpSharedCard {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const Card = styled.article`
  ${cardMotion};
  border: 1px solid ${theme.colors.borderStrong};
  border-radius: 0.75rem;
  background: ${theme.colors.white};
  padding: 0.9rem;
  display: grid;
  gap: 0.55rem;
  box-shadow: ${theme.shadows.card};
  animation: fadeUpSharedCard 220ms ease both;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #ccdaef;
    box-shadow: ${theme.shadows.cardHover};
  }
`;
