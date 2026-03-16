import styled from "styled-components";

export const PendingRequestsSection = styled.section`
  margin-top: 1rem;
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
`;

export const PendingRequestsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin-bottom: 0.7rem;
`;

export const PendingRequestsTitle = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  color: #13213b;
  font-weight: 700;
`;

export const PendingRequestsCount = styled.span`
  border: 1px solid #d5deee;
  background: transparent;
  border-radius: 999px;
  padding: 0.22rem 0.55rem;
  font-size: 0.74rem;
  color: #3b4e6e;
  font-weight: 700;
`;

export const PendingRequestsGrid = styled.div`
  display: grid;
  gap: 0.65rem;
`;

export const PendingRequestCard = styled.article`
  border: 1px solid #dbe3ee;
  border-radius: 0.75rem;
  background: #ffffff;
  padding: 0.75rem;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
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
