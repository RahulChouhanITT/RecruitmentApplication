import styled, { keyframes } from "styled-components";
import type { ToastType } from "../../utils/toast";

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const ToastViewport = styled.div`
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  width: min(26rem, calc(100% - 2rem));
`;

export const ToastItem = styled.div<{ $type: ToastType }>`
  border-radius: 0.625rem;
  padding: 0.875rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid
    ${({ $type }) => ($type === "success" ? "#2e9f5f" : $type === "error" ? "#d83a3a" : "#2e6fd6")};
  background: ${({ $type }) => ($type === "success" ? "#ecfbf2" : $type === "error" ? "#fff1f1" : "#eef4ff")};
  color: ${({ $type }) => ($type === "success" ? "#17653a" : $type === "error" ? "#a52121" : "#17478f")};
  box-shadow: 0 0.5rem 1rem rgba(12, 28, 56, 0.12);
  animation: ${slideIn} 0.18s ease-out;
`;
