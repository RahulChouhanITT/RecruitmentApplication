import styled from 'styled-components';

export const AuthWrapper = styled.section`
  height: 100dvh;
  overflow: hidden;
  box-sizing: border-box;
  background: radial-gradient(
    circle at 10% 20%,
    #e8f2ff 0%,
    #d8ebff 25%,
    #dce7f9 50%,
    #f4f8ff 100%
  );
`;

export const BodyWrapper = styled.main<{ $centerOnMobile?: boolean }>`
  height: calc(100dvh - 4rem);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 1rem;

  @media (max-width: 768px) {
    align-items: ${({ $centerOnMobile }) => ($centerOnMobile ? 'center' : 'flex-start')};
    overflow-y: ${({ $centerOnMobile }) => ($centerOnMobile ? 'hidden' : 'auto')};
    padding: 1rem 1rem 1.5rem;
  }
`;

export const AuthCard = styled.div`
  width: 100%;
  
  max-width: 26.25rem;
  border: 1px solid #dbe5f1;
  border-radius: 0.875rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 30px rgba(36, 86, 140, 0.12);

  @media (max-width: 420px) {
    padding: 1.1rem;
    border-radius: 0.75rem;
  }
`;

export const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.55rem;
  color: #0f172a;
  text-align: center;
`;

export const PageSubtitle = styled.p`
  margin-top: 0.375rem;
  margin-bottom: 0;
  color: #334155;
  text-align: center;
`;
