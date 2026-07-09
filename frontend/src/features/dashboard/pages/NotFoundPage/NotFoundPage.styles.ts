import styled from 'styled-components';

export const PageWrap = styled.section`
  min-height: 100dvh;
  display: grid;
  place-content: center;
  gap: 1rem;
  padding: 1.25rem;
  background: radial-gradient(circle at 10% 20%, #fafafa 0%, #f5f5f5 45%, #f3f4f6 100%);
`;

export const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
`;

export const SecondaryButton = styled.button`
  border: 1px solid #111111;
  background: #111111;
  color: #ffffff;
  border-radius: 0.55rem;
  padding: 0.55rem 0.95rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
`;
