import styled, { keyframes } from 'styled-components';

export const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  cursor: wait;
  /* Transparent overlay to block clicks without dimming the screen */
  background: transparent;
`;

const pulse = keyframes`
  0% { opacity: 0.1; }
  50% { opacity: 0.3; }
  100% { opacity: 0.1; }
`;

export const VisualIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: var(--color-primary, #0052cc);
  animation: ${pulse} 1.5s ease-in-out infinite;
`;
