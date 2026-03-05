import styled from "styled-components";

export const ChatList = styled.div`
  margin-top: 1rem;
  display: grid;
  gap: 0.6rem;
`;

export const ChatItem = styled.article`
  border: 1px solid #dbe3ee;
  border-radius: 0.75rem;
  background: #ffffff;
  padding: 0.75rem;
  display: grid;
  gap: 0.25rem;
`;

export const ChatTitle = styled.strong`
  color: #0f172a;
  font-size: 0.9rem;
`;

export const ChatMeta = styled.span`
  color: #5a6c86;
  font-size: 0.78rem;
`;

export const ChatMessage = styled.p`
  margin: 0.2rem 0 0;
  color: #33445f;
  font-size: 0.84rem;
  line-height: 1.45;
`;
