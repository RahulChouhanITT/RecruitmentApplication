import styled from 'styled-components';

export const DashboardContentCard = styled.section<{ $fullBleed?: boolean }>`
  width: 100%;
  max-width: ${({ $fullBleed }) => ($fullBleed ? 'none' : '1100px')};
  margin: 0 auto;
  padding: ${({ $fullBleed }) => ($fullBleed ? '0 0 1rem' : '0 1rem 1.25rem')};
  display: grid;
  gap: 0.9rem;
  align-content: start;
  min-height: 100%;

  @media (max-width: 900px) {
    width: 100%;
    padding: ${({ $fullBleed }) => ($fullBleed ? '0 0 0.85rem' : '0 0.35rem 1rem')};
  }
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
  border: 1px solid #171b30;
  background: #171b30;
  color: #ffffff;
  border-radius: 0.5rem;
  padding: 0.45rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease;

  &:hover:not(:disabled) {
    background: #ffffff;
    color: #171b30;
    border-color: #171b30;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const DashboardDescription = styled.p`
  margin: 0.8rem 0 0;
  color: #4f5f77;
  font-size: 0.92rem;
  line-height: 1.5;
`;
