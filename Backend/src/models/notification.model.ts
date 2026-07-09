import { Document, Schema, Types, model } from 'mongoose';
import {
  NOTIFICATION_TYPES,
  type NotificationMetadata,
  type NotificationType,
} from '../utils/types';

export interface INotification extends Document {
  userId: Types.ObjectId;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: NotificationMetadata;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const NotificationModel = model<INotification>('Notification', notificationSchema);
