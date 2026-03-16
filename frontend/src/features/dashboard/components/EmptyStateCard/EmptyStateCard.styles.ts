import styled from "styled-components";

const fadeUp = `
  @keyframes fadeUpEmpty {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const EmptyCard = styled.section`
  ${fadeUp}
  border: 1px solid #dbe3ee;
  border-radius: 0.9rem;
  background: #ffffff;
  padding: 1.05rem;
  display: grid;
  gap: 0.35rem;
  justify-items: start;
  box-shadow: 0 10px 22px rgba(16, 32, 58, 0.08);
  animation: fadeUpEmpty 220ms ease both;
`;

export const EmptyIcon = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 0.55rem;
  background: #edf3ff;
  color: #2f6fd6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const EmptyTitle = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  color: #1f2f4d;
  font-weight: 700;
`;

export const EmptyDescription = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #5a6f8b;
  line-height: 1.45;
`;
