import { Types } from "mongoose";
import { isUserOnline } from "../../configuration/socketConfiguration";
import type { UserLite } from "../types/chatTypes";

export const toObjectId = (value: string): Types.ObjectId => new Types.ObjectId(value);

export const toParticipantResponse = (user: UserLite) => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  isOnline: isUserOnline(user._id.toString()),
});

export const normalizeParticipants = (participantIds: string[]): string[] => {
  return [...new Set(participantIds)].filter(Boolean).sort();
};
