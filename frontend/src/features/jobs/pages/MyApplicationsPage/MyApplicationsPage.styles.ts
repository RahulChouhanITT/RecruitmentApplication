import styled from "styled-components";

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
  backdrop-filter: blur(10px);
  padding: 0.2rem 0 0.2rem;
  border-bottom: 1px solid #dbe3ee;
  box-shadow: 0 10px 18px -18px rgba(16, 32, 58, 0.35);
`;

export const SectionTitle = styled.h4`
  margin: 0;
  color: #10203a;
  font-size: 0.98rem;
  font-weight: 700;
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

export const FiltersRow = styled.div`
  display: inline-flex;
  align-items: center;
  justify-self: end;
  position: relative;
`;

export const FilterSelectButton = styled.button`
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #374151;
  border-radius: 999px;
  padding: 0.38rem 2rem 0.38rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 2rem;
  outline: none;
  position: relative;
  text-align: left;
  min-width: 11rem;

  &:focus {
    border-color: #111111;
  }

  &::after {
    content: "";
    position: absolute;
    right: 0.8rem;
    top: 50%;
    width: 0.45rem;
    height: 0.45rem;
    border-right: 2px solid #111827;
    border-bottom: 2px solid #111827;
    transform: translateY(-65%) rotate(45deg);
    pointer-events: none;
  }
`;

export const FilterOptionList = styled.div`
  position: absolute;
  top: calc(100% + 0.35rem);
  right: 0;
  min-width: 11rem;
  border: 1px solid #d1d5db;
  border-radius: 0.8rem;
  background: #ffffff;
  box-shadow: 0 12px 24px rgba(16, 32, 58, 0.14);
  padding: 0.3rem;
  display: grid;
  gap: 0.2rem;
  z-index: 20;
`;

export const FilterOptionButton = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? "#111111" : "transparent")};
  background: ${({ $active }) => ($active ? "#111111" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#111827")};
  border-radius: 0.6rem;
  padding: 0.48rem 0.7rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.16s ease, color 0.16s ease, border-color 0.16s ease;

  &:hover {
    background: ${({ $active }) => ($active ? "#000000" : "#f3f4f6")};
    border-color: ${({ $active }) => ($active ? "#000000" : "transparent")};
  }
`;

export const CardsGrid = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;
