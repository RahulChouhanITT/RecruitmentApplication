import styled from 'styled-components';

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

export const ErrorText = styled.p<{ $visible?: boolean }>`
  min-height: 0.7rem;
  color: red;
  font-size: 0.8rem;
  margin-top: 0.125rem;
  margin-bottom: 0;
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
`;
