import styled from 'styled-components';

const cardMotion = `
  @keyframes fadeUpJobCard {
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

export const Card = styled.article`
  ${cardMotion}
  border: 1px solid #dbe3ee;
  border-radius: 0.9rem;
  background: #fff;
  padding: 1rem;
  box-shadow: 0 6px 16px rgba(16, 32, 58, 0.06);
  display: grid;
  gap: 0.55rem;
  animation: fadeUpJobCard 220ms ease both;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #cfdcf2;
    box-shadow: 0 14px 28px rgba(16, 32, 58, 0.11);
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.7rem;
`;

export const Title = styled.h4`
  margin: 0;
  color: #10203a;
  font-size: 1rem;
  font-weight: 700;
`;

export const StatusPill = styled.span<{ $active?: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? '#70c2a1' : '#c9d5e8')};
  color: ${({ $active }) => ($active ? '#16794d' : '#566a86')};
  background: ${({ $active }) => ($active ? '#ebf8f1' : '#f4f7fc')};
  border-radius: 999px;
  padding: 0.2rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
`;

export const Meta = styled.p`
  margin: 0;
  color: #425978;
  font-size: 0.84rem;
  line-height: 1.35;
  display: inline-flex;
  align-items: flex-start;
  gap: 0.35rem;
  word-break: break-word;
  overflow-wrap: anywhere;

  svg {
    flex-shrink: 0;
    margin-top: 0.1rem;
    color: #5e718d;
  }
`;

export const ActionButton = styled.button`
  justify-self: start;
  border: 1px solid #1d4fa8;
  background: #2f6fd6;
  color: #fff;
  border-radius: 0.55rem;
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 2px 4px -2px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-1px);
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.3),
      0 4px 6px -4px rgba(0, 0, 0, 0.3);
    background: #000000;
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #4b5563;
    box-shadow: none;
    transform: none;
  }

  @media (max-width: 640px) {
    width: 100%;
    justify-self: stretch;
    text-align: center;
  }
`;
