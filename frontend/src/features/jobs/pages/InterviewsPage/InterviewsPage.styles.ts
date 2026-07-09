import styled from 'styled-components';

export const PageWrap = styled.div`
  display: grid;
  gap: 1rem;
`;

export const StickyHeader = styled.div`
  position: sticky;
  top: -1px;
  z-index: 5;
  display: grid;
  gap: 0.65rem;
  background: radial-gradient(circle at 10% 20%, #fafafa 0%, #f5f5f5 45%, #f3f4f6 100%);
  padding: 0.2rem 0 0.2rem;
  border-bottom: 1px solid #dbe3ee;
  box-shadow: 0 10px 18px -18px rgba(16, 32, 58, 0.35);
`;

export const FiltersRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  justify-self: end;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;

export const ControlsRow = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 20rem) minmax(0, 1fr);
  align-items: center;
  gap: 0.7rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const FilterButton = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? '#111111' : '#d1d5db')};
  background: ${({ $active }) => ($active ? '#111111' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#374151')};
  border-radius: 999px;
  padding: 0.35rem 0.72rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
`;

export const Section = styled.section`
  display: grid;
  gap: 0.65rem;
`;

export const SectionTitle = styled.h4`
  margin: 0;
  color: #10203a;
  font-size: 0.98rem;
  font-weight: 700;
`;

export const CardsGrid = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;
