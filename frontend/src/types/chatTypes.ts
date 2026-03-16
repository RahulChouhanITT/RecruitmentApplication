export type ChatParticipant = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isOnline?: boolean;
};

export type ChatConversation = {
  _id: string;
  participants: ChatParticipant[];
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  _id: string;
  conversationId: string;
  sender: ChatParticipant;
  message: string;
  status: "SENT" | "DELIVERED" | "SEEN";
  createdAt: string;
  updatedAt: string;
};

export type ChatApiResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
};
