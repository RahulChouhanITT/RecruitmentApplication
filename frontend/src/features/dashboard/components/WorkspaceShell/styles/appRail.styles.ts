import styled from 'styled-components';

export const AppRail = styled.aside`
  background: #fafafa;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 0.5rem;

  @media (max-width: 820px) {
    position: relative;
    z-index: 3300;
  }

  @media (max-width: 640px) {
    gap: 0.35rem;
    padding: 0.65rem 0.3rem;
  }
`;

export const AppRailHeader = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: 0.7rem;
  border: 1px solid transparent;
  background: var(--accent);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.18s ease;

  &:hover {
    background: #000000;
  }
`;

export const AppRailItem = styled.button<{ $isActive: boolean }>`
  width: 100%;
  box-sizing: border-box;
  border: 0;
  position: relative;
  background: ${({ $isActive }) => ($isActive ? '#f3f4f6' : 'transparent')};
  color: ${({ $isActive }) => ($isActive ? '#111111' : '#4b5563')};
  border-radius: 0.7rem;
  padding: 0.5rem 0.2rem;
  display: grid;
  place-items: center;
  gap: 0.2rem;
  cursor: pointer;

  .rail-icon {
    width: 1.2rem;
    height: 1.2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .rail-icon svg {
    width: 18px;
    height: 18px;
    display: block;
    flex-shrink: 0;
  }

  .rail-badge {
    position: absolute;
    top: 0.08rem;
    right: 0.52rem;
    min-width: 16px;
    height: 16px;
    padding: 0 3px;
    border-radius: 999px;
    background: #d93025;
    color: #ffffff;
    font-size: 0.58rem;
    font-weight: 700;
    line-height: 16px;
    text-align: center;
    border: 1px solid #f3f4f8;
    z-index: 2;
  }

  span:not(.rail-icon):not(.rail-badge) {
    font-size: 0.66rem;
    line-height: 1;
    font-weight: 600;
    display: block;
    width: 100%;
    text-align: center;
    white-space: nowrap;
  }

  @media (max-width: 820px) {
    padding: 0.45rem 0.15rem;

    span:not(.rail-icon):not(.rail-badge) {
      font-size: 0.62rem;
      padding: 0 1px;
    }
  }

  @media (max-width: 640px) {
    border-radius: 0.6rem;
    padding: 0.42rem 0.1rem;

    .rail-icon svg {
      width: 16px;
      height: 16px;
    }

    .rail-badge {
      right: 0.22rem;
    }

    span:not(.rail-icon):not(.rail-badge) {
      font-size: 0.58rem;
      line-height: 1;
      white-space: nowrap;
    }
  }
`;

export const AppRailBottom = styled.div`
  margin-top: auto;
  width: 100%;
`;

export const AppIconButton = styled.button`
  width: 100%;
  box-sizing: border-box;
  border: 0;
  background: transparent;
  color: #4c5667;
  border-radius: 0.7rem;
  padding: 0.45rem 0.25rem;
  display: grid;
  place-items: center;
  gap: 0.2rem;
  cursor: pointer;

  span {
    font-size: 0.62rem;
    font-weight: 700;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
