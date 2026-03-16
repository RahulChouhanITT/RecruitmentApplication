import { Types } from "mongoose";

export const CHAT_MESSAGE_STATUSES = ["SENT", "DELIVERED", "SEEN"] as const;
export type ChatMessageStatus = (typeof CHAT_MESSAGE_STATUSES)[number];

export type DirectConversationRequest = {
  participantId: string;
};

export type SendMessageRequest = {
  message: string;
};

export type UserLite = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: string;
};

export type ChatConversationLean = {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  lastMessage: string;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PopulatedChatConversationLean = Omit<ChatConversationLean, "participants"> & {
  participants: UserLite[];
};

export type PopulatedChatMessageLean = {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: UserLite;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};
