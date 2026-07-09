import { Document, Schema, Types, model } from 'mongoose';
import { CHAT_MESSAGE_STATUSES, type ChatMessageStatus } from '../utils/types/chatTypes';

export interface IChatMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  message: string;
  status: ChatMessageStatus;
  seenBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatConversation',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: CHAT_MESSAGE_STATUSES,
      default: CHAT_MESSAGE_STATUSES[0],
    },
    seenBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true },
);

chatMessageSchema.index({ conversationId: 1, createdAt: 1 });

export const ChatMessageModel = model<IChatMessage>('ChatMessage', chatMessageSchema);
