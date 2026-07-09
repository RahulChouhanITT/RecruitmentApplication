import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Dropdown = styled.div<{ $fixed?: boolean }>`
  position: ${({ $fixed }) => ($fixed ? 'fixed' : 'absolute')};
  right: ${({ $fixed }) => ($fixed ? 'auto' : '0.15rem')};
  top: ${({ $fixed }) => ($fixed ? 'auto' : 'calc(100% + 0.3rem)')};
  min-width: 10.5rem;
  border: 1px solid ${theme.colors.borderStrong};
  border-radius: 0.55rem;
  background: ${theme.colors.white};
  box-shadow: ${theme.shadows.floating};
  display: grid;
  z-index: 6000;
  padding: 0.2rem 0;
`;

export const DropdownItem = styled.button`
  border: none;
  background: transparent;
  padding: 0.5rem 0.75rem;
  text-align: left;
  color: ${theme.colors.textSecondary};
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.hoverBg};
    color: ${theme.colors.primary};
  }
`;
