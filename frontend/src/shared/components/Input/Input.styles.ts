import styled from "styled-components";

export const InputGroup = styled.div`
  margin-bottom: 0rem;
`;

export const LabelRow = styled.div`
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.4rem;
`;

export const InputLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  color: #1f2937;
  font-weight: 500;
`;

export const InfoWrapper = styled.span`
  display: inline-flex;
  align-items: flex-start;
  gap: 0.35rem;
  min-width: 0;
  max-width: 100%;
`;

export const InfoButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.05rem;
  height: 1.05rem;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: default;
  padding: 0;
`;

export const InfoHint = styled.span`
  display: inline;
  position: relative;
  top: 2px;
  font-size: 0.66rem;
  color: #94a3b8;
  font-weight: 400;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.25;
  max-width: 100%;
`;

export const StyledInput = styled.input<{ $hasError?: boolean }>`
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
