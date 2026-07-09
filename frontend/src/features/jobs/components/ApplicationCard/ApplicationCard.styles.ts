import styled from 'styled-components';

const cardMotion = `
  @keyframes fadeUpApplicationCard {
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
  gap: 0.5rem;
  position: relative;
  animation: fadeUpApplicationCard 220ms ease both;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #cfdcf2;
    box-shadow: 0 14px 28px rgba(16, 32, 58, 0.11);
  }

  @media (max-width: 640px) {
    padding: 0.85rem;
    gap: 0.48rem;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

export const Title = styled.h4`
  margin: 0;
  color: #10203a;
  font-size: 1rem;
  font-weight: 700;
  min-width: 0;
  flex: 1 1 12rem;
  overflow-wrap: anywhere;

  @media (max-width: 640px) {
    font-size: 0.95rem;
  }
`;

export const Meta = styled.p`
  margin: 0;
  color: #425978;
  font-size: 0.84rem;
  line-height: 1.35;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 0.35rem;
  overflow-wrap: anywhere;
  word-break: break-word;

  svg {
    flex-shrink: 0;
    margin-top: 0.1rem;
    color: #5e718d;
  }

  @media (max-width: 640px) {
    font-size: 0.8rem;
  }
`;
