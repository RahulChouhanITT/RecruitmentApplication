import { useMemo } from "react";
import { useAppSelector } from "../../../../app/hooks";
import { DashboardDescription } from "../../pages/DashboardPage/DashboardPage.styles";
import { ChatItem, ChatList, ChatMessage, ChatMeta, ChatTitle } from "./ChatThreadsPanel.styles";

type ChatThread = {
  id: string;
  participantIds: string[];
  title: string;
  lastMessage: string;
  lastUpdatedAt: string;
  unreadCount: number;
};

const buildMockThreads = (currentUserId: string): ChatThread[] => [
  {
    id: "chat-1",
    participantIds: [currentUserId, "u-hr-1"],
    title: "HR - Screening Discussion",
    lastMessage: "Please share your updated profile summary by today.",
    lastUpdatedAt: "10:15 AM",
    unreadCount: 1,
  },
  {
    id: "chat-2",
    participantIds: [currentUserId, "u-int-1"],
    title: "Interview Coordination",
    lastMessage: "Interview slot moved to tomorrow at 4:00 PM.",
    lastUpdatedAt: "Yesterday",
    unreadCount: 0,
  },
];

export const ChatThreadsPanel = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const currentUserId = currentUser?._id || "temp-user";
  const mockThreads = useMemo(() => buildMockThreads(currentUserId), [currentUserId]);

  const myThreads = useMemo(
    () => mockThreads.filter((thread) => thread.participantIds.includes(currentUserId)),
    [currentUserId, mockThreads]
  );

  if (myThreads.length === 0) {
    return <DashboardDescription>No chats found for current user.</DashboardDescription>;
  }

  return (
    <ChatList>
      {myThreads.map((thread) => (
        <ChatItem key={thread.id}>
          <ChatTitle>{thread.title}</ChatTitle>
          <ChatMeta>
            {thread.lastUpdatedAt} {thread.unreadCount > 0 ? `• ${thread.unreadCount} unread` : ""}
          </ChatMeta>
          <ChatMessage>{thread.lastMessage}</ChatMessage>
        </ChatItem>
      ))}
    </ChatList>
  );
};
