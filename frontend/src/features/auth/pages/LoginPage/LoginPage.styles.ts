import { Link } from "react-router-dom";
import styled from "styled-components";

export const PageContent = styled.div`
  width: 100%;
`;

export const AuthSwitchText = styled.p`
  margin-top: 0.5rem;
  margin-bottom: 0;
  font-size: 0.875rem;
  color: #475569;
  text-align: center;
`;

export const AuthSwitchLink = styled(Link)`
  color: #005ea8;
  text-decoration: none;
  font-weight: 600;
`;

export const AuthMessage = styled.p<{ $type: "error" | "success" }>`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ $type }) => ($type === "error" ? "#dc2626" : "#166534")};
  text-align: center;
`;
