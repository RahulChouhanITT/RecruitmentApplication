import styled from 'styled-components';

export const NotificationRoot = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

export const NotificationButton = styled.button`
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #d7e1f2;
  border-radius: 999px;
  background: #ffffff;
  color: #243b67;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    border-color 140ms ease,
    color 140ms ease,
    transform 140ms ease;

  &:hover {
    color: #1d4fa8;
    border-color: #a8bee8;
    transform: translateY(-1px);
  }
`;

export const NotificationBadge = styled.span`
  position: absolute;
  top: -0.2rem;
  right: -0.2rem;
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 0.25rem;
  border-radius: 999px;
  background: #df3c4b;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const NotificationDropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.6rem);
  right: 0;
  width: min(22rem, calc(100vw - 2rem));
  max-height: 24rem;
  overflow: auto;
  border: 1px solid #dfe7f5;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(24, 44, 82, 0.16);
  z-index: 20;
`;

export const NotificationHeader = styled.div`
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #eef3fb;
  display: flex;
  align-items: center;
  justify-content: space-between;

  strong {
    font-size: 0.95rem;
    color: #203251;
  }

  button {
    border: none;
    background: transparent;
    color: #3564df;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
  }
`;

export const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const NotificationItemRow = styled.div<{ $isRead: boolean }>`
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #f1f5fb;
  background: ${({ $isRead }) => ($isRead ? '#ffffff' : '#f7faff')};
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  justify-content: space-between;

  &:last-child {
    border-bottom: none;
  }
`;

export const NotificationMessage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  strong {
    font-size: 0.76rem;
    letter-spacing: 0.04em;
    color: #4d6590;
  }

  span {
    color: #203251;
    font-size: 0.88rem;
    line-height: 1.4;
  }

  small {
    color: #7185a8;
    font-size: 0.75rem;
  }
`;

export const NotificationAction = styled.button`
  border: none;
  background: transparent;
  color: #3564df;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
`;

export const NotificationEmpty = styled.div`
  padding: 1.1rem 1rem;
  color: #6c7f9f;
  font-size: 0.88rem;
  text-align: center;
`;
