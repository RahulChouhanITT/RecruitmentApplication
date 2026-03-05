import styled from "styled-components";

export const HeaderRoot = styled.header`
  width: 100%;
  border-bottom: 1px solid #dbe3f0;
  background: #ffffff;
`;

export const HeaderInner = styled.div`
  width: 100%;
  min-height: 4rem;
  padding: 0 1.25rem;
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
  border-radius: 0.5rem;
  background: #2f6fd6;
  color: #ffffff;
  flex-shrink: 0;
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
`;

export const UserName = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1;
`;
