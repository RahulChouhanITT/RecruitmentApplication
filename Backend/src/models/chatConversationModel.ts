import { Document, Schema, Types, model } from 'mongoose';
import { MODEL_DEFAULT_VALUES } from '../utils/constants/modelConstants';

export interface IChatConversation extends Document {
  participants: Types.ObjectId[];
  lastMessage: string;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const chatConversationSchema = new Schema<IChatConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: String,
      trim: true,
      default: MODEL_DEFAULT_VALUES.EMPTY_STRING,
      maxlength: 3000,
    },
    lastMessageAt: {
      type: Date,
      default: MODEL_DEFAULT_VALUES.NULL,
    },
  },
  { timestamps: true },
);

chatConversationSchema.index({ participants: 1 });
chatConversationSchema.index({ lastMessageAt: -1 });

export const ChatConversationModel = model<IChatConversation>(
  'ChatConversation',
  chatConversationSchema,
);
