import styled from "styled-components";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

export const InputGroup = styled.div`
  margin-bottom: 0;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
  color: #1f2937;
  font-weight: 500;
`;

export const Select = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  box-sizing: border-box;
  min-height: 2.5rem;
  padding: 0.625rem 0.75rem;
  line-height: 1.25;
  font-size: 0.95rem;
  border-radius: 0.375rem;
  border: 1px solid ${({ $hasError }) => ($hasError ? "red" : "#ddd")};
  background: #fff;

  &:focus {
    outline: none;
    border-color: ${({ $hasError }) => ($hasError ? "red" : "#4285f4")};
  }
`;

export const ErrorText = styled.p<{ $visible?: boolean }>`
  min-height: 0.7rem;
  color: red;
  font-size: 0.8rem;
  margin-top: 0.125rem;
  margin-bottom: 0;
  visibility: ${({ $visible }) => ($visible ? "visible" : "hidden")};
`;
