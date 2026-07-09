import styled from 'styled-components';

export const HeaderRoot = styled.header`
  width: 100%;
  border-bottom: 1px solid #e4ebf7;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
`;

export const HeaderInner = styled.div`
  width: 100%;
  min-height: 4rem;
  padding: 0 1.3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const BrandRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  line-height: 1;
`;

export const BrandLogo = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.6rem;
  background: linear-gradient(140deg, #3564df 0%, #4d7def 100%);
  color: #ffffff;
  flex-shrink: 0;
  box-shadow: 0 8px 16px rgba(53, 100, 223, 0.28);
`;

export const BrandName = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 700;
  color: #1f2f4d;
  line-height: 1;
`;

export const UserRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #243b67;
  line-height: 1;
  cursor: pointer;
  transition:
    color 140ms ease,
    transform 140ms ease;

  &:hover {
    color: #1d4fa8;
    transform: translateY(-1px);
  }
`;

export const UserName = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1;
`;
