import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 3200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 18, 40, 0.45);
  padding: 1rem;
`;

export const Card = styled.div`
  width: min(38rem, 100%);
  border-radius: 0.875rem;
  background: #ffffff;
  border: 1px solid #d7deea;
  box-shadow: 0 1rem 2rem rgba(14, 27, 54, 0.2);
  padding: 1.1rem 1.1rem 0.9rem;
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1c2b4a;
`;

export const Row = styled.div`
  margin-top: 0.8rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.label`
  display: grid;
  gap: 0.32rem;

  span {
    font-size: 0.8rem;
    color: #3a4a67;
    font-weight: 600;
  }
`;

export const Input = styled.input`
  border: 1px solid #c8d3e7;
  background: #ffffff;
  border-radius: 0.5rem;
  padding: 0.5rem 0.62rem;
  font-size: 0.86rem;
  color: #1e2f4d;
  outline: none;

  &:focus {
    border-color: #2f6fd6;
    box-shadow: 0 0 0 2px rgba(47, 111, 214, 0.15);
  }
`;

export const ErrorText = styled.p`
  margin: 0.7rem 0 0;
  color: #a11f1f;
  font-size: 0.8rem;
`;

export const Actions = styled.div`
  margin-top: 0.95rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
`;

export const Button = styled.button`
  border: 1px solid #c8d3e7;
  background: #f2f6ff;
  color: #224b97;
  border-radius: 0.5rem;
  padding: 0.55rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
`;

export const PrimaryButton = styled.button`
  border: 1px solid #1d4fa8;
  background: #2f6fd6;
  color: #ffffff;
  border-radius: 0.5rem;
  padding: 0.55rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
