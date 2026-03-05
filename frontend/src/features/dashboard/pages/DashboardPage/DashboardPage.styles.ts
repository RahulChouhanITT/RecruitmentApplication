import styled from "styled-components";

export const DashboardContentCard = styled.section`
  background: #ffffff;
  border: 1px solid #dce3ec;
  border-radius: 0.9rem;
  padding: 1rem;
  box-shadow: 0 8px 22px rgba(18, 29, 56, 0.06);
`;

export const DashboardTitle = styled.h1`
  margin: 0;
  font-size: 1.25rem;
  color: #0f172a;
  font-weight: 700;
`;

export const DashboardHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

export const LogoutButton = styled.button`
  border: 1px solid #dbe3ee;
  background: #ffffff;
  color: #0f172a;
  border-radius: 0.5rem;
  padding: 0.45rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const DashboardDescription = styled.p`
  margin: 0.8rem 0 0;
  color: #4f5f77;
  font-size: 0.92rem;
  line-height: 1.5;
`;
