import styled from 'styled-components';

export const PanelRoot = styled.section`
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  h2 {
    margin: 0;
    font-size: 1.15rem;
    color: #203251;
  }

  p {
    margin: 0.25rem 0 0;
    color: #6d7f9f;
    font-size: 0.85rem;
  }

  button {
    border: none;
    background: #1f5eff;
    color: #ffffff;
    padding: 0.7rem 1rem;
    border-radius: 0.8rem;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
  }
`;

export const PanelList = styled.div`
  display: grid;
  gap: 0.8rem;
`;

export const PanelCard = styled.article<{ $isRead: boolean }>`
  border: 1px solid ${({ $isRead }) => ($isRead ? '#e3eaf5' : '#bfd2ff')};
  background: ${({ $isRead }) => ($isRead ? '#ffffff' : '#f7faff')};
  border-radius: 1rem;
  padding: 1rem 1rem 0.95rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
`;

export const PanelMessage = styled.div`
  display: grid;
  gap: 0.32rem;

  strong {
    color: #55709a;
    font-size: 0.74rem;
    letter-spacing: 0.05em;
  }

  span {
    color: #203251;
    font-size: 0.93rem;
    line-height: 1.45;
  }

  small {
    color: #7a8ba8;
    font-size: 0.76rem;
  }
`;

export const PanelAction = styled.button`
  border: none;
  background: transparent;
  color: #1f5eff;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
`;

export const PanelEmpty = styled.div`
  border: 1px dashed #d4ddea;
  border-radius: 1rem;
  padding: 2rem 1rem;
  text-align: center;
  color: #6d7f9f;
  background: rgba(255, 255, 255, 0.78);
`;
