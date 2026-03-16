import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 3600;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(11, 20, 37, 0.42);
  padding: 1rem;
`;

export const Card = styled.div`
  width: min(30rem, 100%);
  border: 1px solid #e5e7eb;
  border-radius: 0.8rem;
  background: #fff;
  box-shadow: 0 16px 34px rgba(16, 28, 48, 0.2);
  padding: 1rem;
  display: grid;
  gap: 0.75rem;
`;

export const Title = styled.h3`
  margin: 0;
  color: #10203a;
  font-size: 1rem;
  font-weight: 700;
`;

export const Grid = styled.div`
  display: grid;
  gap: 0.55rem;
`;

export const Label = styled.label`
  display: grid;
  gap: 0.25rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: #1f2937;
`;

export const Select = styled.select`
  min-height: 2.45rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.55rem 0.7rem;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #2f6fd6;
    box-shadow: 0 0 0 3px rgba(47, 111, 214, 0.14);
  }
`;

export const Textarea = styled.textarea`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.55rem 0.7rem;
  min-height: 6rem;
  resize: vertical;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #2f6fd6;
    box-shadow: 0 0 0 3px rgba(47, 111, 214, 0.14);
  }
`;

export const ErrorText = styled.span`
  min-height: 1rem;
  color: #dc2626;
  font-size: 0.78rem;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

export const GhostButton = styled.button`
  border: 1px solid #d3dbea;
  background: #fff;
  color: #2d3f5f;
  border-radius: 0.5rem;
  padding: 0.45rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
`;

export const PrimaryButton = styled.button`
  border: 1px solid #1d4fa8;
  background: #2f6fd6;
  color: #fff;
  border-radius: 0.5rem;
  padding: 0.45rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;
