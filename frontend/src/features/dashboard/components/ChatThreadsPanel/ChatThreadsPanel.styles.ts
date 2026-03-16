import styled from "styled-components";

const panelMotion = `
  @keyframes fadeUpChatPanel {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const ChatLayout = styled.section<{ $singlePane?: boolean }>`
  ${panelMotion}
  display: grid;
  grid-template-columns: ${(props) => (props.$singlePane ? "minmax(0, 1fr)" : "330px minmax(0, 1fr)")};
  gap: 0;
  min-height: 78vh;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  overflow: hidden;
  background: linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%);
  box-shadow: 0 14px 32px rgba(16, 32, 58, 0.1);
  animation: fadeUpChatPanel 220ms ease both;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const ChatListPanel = styled.div<{ $singlePane?: boolean }>`
  background: #fafafa;
  border-right: ${({ $singlePane }) => ($singlePane ? "none" : "1px solid #e5e7eb")};
  display: grid;
  grid-template-rows: auto auto 1fr;
  min-height: 0;
`;

export const ChatPanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1rem 0.65rem;

  h3 {
    margin: 0;
    font-size: 1.58rem;
    font-weight: 700;
    color: #20242e;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

export const HeaderIconButton = styled.button`
  border: none;
  background: transparent;
  color: #6b7280;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

export const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 1rem 0.72rem;
`;

export const FilterPill = styled.span`
  border: 1px solid #d2d2d2;
  border-radius: 999px;
  color: #242424;
  font-size: 0.73rem;
  line-height: 1;
  padding: 0.37rem 0.58rem;
  background: #ffffff;
`;

export const ChatList = styled.div`
  overflow-y: auto;
  padding: 0.2rem 0.5rem 0.8rem;
  display: grid;
  gap: 0.14rem;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;

export const ChatItem = styled.button<{ $isActive?: boolean }>`
  width: 100%;
  border: none;
  background: ${(props) => (props.$isActive ? "#ffffff" : "transparent")};
  border-radius: 8px;
  padding: 0.58rem 0.52rem;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  gap: 0.62rem;
  text-align: left;
  cursor: pointer;
  box-shadow: ${(props) => (props.$isActive ? "0 0 0 1px #d1d5db inset" : "none")};
  transition: background-color 140ms ease, transform 140ms ease;

  &:hover {
    background: #ffffff;
    transform: translateY(-1px);
  }
`;

export const Avatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #e5e7eb;
  color: #111827;
  display: grid;
  place-items: center;
  font-size: 0.83rem;
  font-weight: 700;
`;

export const ChatItemContent = styled.div`
  min-width: 0;
`;

export const ChatTitle = styled.strong`
  color: #232936;
  font-size: 0.87rem;
  display: block;
  font-weight: 600;
`;

export const ChatMeta = styled.span`
  color: #6b7280;
  font-size: 0.72rem;
`;

export const ChatMessage = styled.p`
  margin: 0.15rem 0 0;
  color: #6b7280;
  font-size: 0.78rem;
  line-height: 1.34;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const UnreadBadge = styled.span`
  align-self: center;
  min-width: 18px;
  height: 18px;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: #ff6a00;
  color: #fff;
  font-size: 0.66rem;
  line-height: 18px;
  text-align: center;
  font-weight: 700;
`;

export const MessagePane = styled.div`
  background: #fafafa;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 0;
  max-height: 78vh;
  overflow: hidden;
`;

export const MessageHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 3;
  padding: 1rem 1.1rem 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(180deg, rgba(248, 251, 255, 0.98) 0%, rgba(241, 246, 255, 0.95) 100%);
  box-shadow: 0 1px 0 rgba(17, 24, 39, 0.04);
`;

export const HeaderTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

export const HeaderUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

export const HeaderAvatar = styled.span`
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: #e5e7eb;
  color: #111827;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const HeaderTitle = styled.strong`
  color: #1f2430;
  font-size: 1.2rem;
  font-weight: 700;
`;

export const HeaderTabs = styled.div`
  margin-top: 0.7rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  span {
    color: #6b7280;
    font-size: 0.86rem;
    padding-bottom: 0;
    border-bottom: none;
    text-decoration: none;
  }

  span.active {
    color: #101010;
    border-bottom: none;
    font-weight: 600;
  }

  span.active.online {
    color: #16a34a;
    border-bottom: none;
  }

  span.active.offline {
    color: #101010;
    border-bottom: none;
  }
`;

export const MessageList = styled.div`
  padding: 1.1rem 1.2rem;
  display: grid;
  gap: 0.8rem;
  overflow-y: auto;
  min-height: 0;
  align-content: start;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;

export const MessageDateDivider = styled.div`
  justify-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.28rem 0.72rem;
  border-radius: 999px;
  background: #111111;
  border: 1px solid #111111;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 6px 14px rgba(17, 17, 17, 0.16);
`;

export const MessageBubble = styled.article<{ $isMine: boolean }>`
  position: relative;
  max-width: min(78%, 780px);
  justify-self: ${(props) => (props.$isMine ? "end" : "start")};
  background: ${(props) => (props.$isMine ? "#f3f4f6" : "#ffffff")};
  border: 1px solid ${(props) => (props.$isMine ? "#d1d5db" : "#e5e7eb")};
  color: #252b36;
  border-radius: 10px;
  padding: 0.55rem 0.85rem 0.35rem;
  display: grid;
  gap: 0.35rem;
  box-shadow: 0 6px 14px rgba(16, 32, 58, 0.06);
  transition: transform 120ms ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

export const MessageText = styled.p`
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.44;
  white-space: pre-wrap;
  word-break: break-word;
  padding-right: 68px;
  padding-bottom: 4px;
`;

export const MessageTime = styled.span`
  position: absolute;
  right: 9px;
  bottom: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.24rem;
  font-size: 0.68rem;
  line-height: 1;
  color: #6b7280;

  .status-icon {
    margin-top: 1px;
  }

  .status-seen {
    color: #2a73ff;
  }
`;

export const Composer = styled.form`
  padding: 0.95rem 1rem 1.05rem;
  border-top: 1px solid #e5e7eb;
  background: #fff;
  display: grid;
  gap: 0.55rem;
`;

export const ComposerBox = styled.div`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 10px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 0.45rem;
  padding: 0.45rem 0.5rem 0.45rem 0.8rem;
  min-height: 52px;
`;

export const ComposerInput = styled.textarea`
  border: none;
  padding: 0.35rem 0.1rem;
  font-size: 0.9rem;
  color: #192133;
  resize: none;
  min-height: 42px;
  max-height: 130px;
  background: transparent;

  &:focus {
    outline: none;
  }
`;

export const ComposerActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.24rem;
`;

export const ComposerIconButton = styled.button`
  border: none;
  background: transparent;
  color: #3f3f3f;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: #f1f1f1;
    color: #171717;
  }
`;

export const ComposerButton = styled.button`
  border: none;
  background: #171b30;
  color: #ffffff;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  cursor: pointer;

  &:hover {
    background: #12162a;
  }

  &:disabled {
    cursor: not-allowed;
    background: #8e908f;
    color: #ffffff;
  }
`;

export const StartChatButton = styled.button`
  margin-top: 0.75rem;
  border: 1px solid #171b30;
  border-radius: 0.68rem;
  background: #171b30;
  color: #ffffff;
  padding: 0.58rem 0.9rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    background: #8e908f;
  }
`;
