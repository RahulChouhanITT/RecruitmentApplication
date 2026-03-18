import styled from "styled-components";

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 18, 40, 0.45);
  padding: 1rem;
`;

export const ModalCard = styled.div`
  width: min(30rem, 100%);
  border-radius: 0.875rem;
  background: #ffffff;
  border: 1px solid #d7deea;
  box-shadow: 0 1rem 2rem rgba(14, 27, 54, 0.2);
  padding: 1.25rem 1.25rem 1rem;
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1c2b4a;
`;

export const ModalMessage = styled.p`
  margin: 0.75rem 0 1rem;
  font-size: 0.95rem;
  line-height: 1.45;
  color: #384969;
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
`;

export const ModalButton = styled.button`
  border: 1px solid #c8d3e7;
  background: #f2f6ff;
  color: #224b97;
  border-radius: 0.5rem;
  padding: 0.55rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #e7efff;
  }
`;

export const ModalPrimaryButton = styled.button`
  border: 1px solid #1d4fa8;
  background: #2f6fd6;
  color: #ffffff;
  border-radius: 0.5rem;
  padding: 0.55rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #265eb5;
  }
`;
