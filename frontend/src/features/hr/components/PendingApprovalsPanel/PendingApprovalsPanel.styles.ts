import styled from "styled-components";

export const PendingRequestsGrid = styled.div`
  margin-top: 1rem;
  display: grid;
  gap: 0.65rem;
`;

export const PendingRequestCard = styled.article`
  border: 1px solid #dbe3ee;
  border-radius: 0.75rem;
  background: #ffffff;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
`;

export const PendingRequestInfo = styled.div`
  min-width: 0;
  display: grid;
  gap: 0.22rem;

  strong {
    color: #0f172a;
    font-size: 0.92rem;
  }

  span {
    color: #5a6c86;
    font-size: 0.8rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 24rem;
  }
`;

export const PendingRequestActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
`;

export const ApproveButton = styled.button`
  border: 1px solid #9ed6b3;
  background: #eefbf3;
  color: #116a39;
  border-radius: 0.45rem;
  padding: 0.35rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
