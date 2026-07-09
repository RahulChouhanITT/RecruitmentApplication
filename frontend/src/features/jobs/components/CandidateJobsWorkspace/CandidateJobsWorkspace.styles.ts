import styled from 'styled-components';

export const Wrap = styled.div`
  display: grid;
  gap: 0.8rem;
`;

export const Tabs = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
`;

export const TabButton = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? '#1d4fa8' : '#d3dbea')};
  background: ${({ $active }) => ($active ? '#eaf1ff' : '#fff')};
  color: ${({ $active }) => ($active ? '#1d4fa8' : '#2d3f5f')};
  border-radius: 999px;
  padding: 0.38rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
`;
