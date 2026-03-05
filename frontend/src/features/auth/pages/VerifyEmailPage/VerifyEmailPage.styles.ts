import { Link } from "react-router-dom";
import styled from "styled-components";

export const PageContent = styled.div`
  width: 100%;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const HelperText = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #475569;
  text-align: center;
  width: 100%;
`;

export const ResendRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.15rem;
`;

export const ResendButton = styled.button`
  border: none;
  background: transparent;
  color: #005ea8;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;

  &:disabled {
    color: #9aa7bc;
    cursor: not-allowed;
  }
`;

export const BottomMessage = styled.p`
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #475569;
  text-align: center;
`;

export const BackLink = styled(Link)`
  color: #005ea8;
  text-decoration: none;
  font-weight: 600;
`;
