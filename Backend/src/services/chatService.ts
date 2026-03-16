import { Types } from "mongoose";
import { buildUserRoom, getSocketServer, isUserOnline } from "../configuration/socketConfiguration";
import { ChatConversationModel } from "../models/chatConversationModel";
import { ChatMessageModel } from "../models/chatMessageModel";
import { InterviewModel } from "../models/interviewModel";
import { UserModel } from "../models/userModel";
import { ApplicationError, APPLICATION_CONSTANTS, APPLICATION_MESSAGES } from "../utils";
import {
  CHAT_MESSAGE_STATUSES,
  type UserLite,
  type ChatConversationLean,
  type PopulatedChatConversationLean,
  type PopulatedChatMessageLean,
} from "../utils/types";

const toObjectId = (value: string): Types.ObjectId => new Types.ObjectId(value);

const toParticipantResponse = (user: UserLite) => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  isOnline: isUserOnline(user._id.toString()),
});

const normalizeParticipants = (participantIds: string[]): string[] => {
  return [...new Set(participantIds)].filter(Boolean).sort();
};

const findUsersByIds = async (userIds: string[]): Promise<UserLite[]> => {
  const users = await UserModel.find({ _id: { $in: userIds } }).select("_id name email role").lean<UserLite[]>();
  if (users.length !== userIds.length) {
    throw new ApplicationError(APPLICATION_MESSAGES.CHAT.USERS_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);
  }
  return users;
};

const canCandidateTalkToInterviewer = async (candidateId: string, interviewerId: string): Promise<boolean> => {
  const interviewExists = await InterviewModel.exists({
    candidateId: toObjectId(candidateId),
    interviewerId: toObjectId(interviewerId),
  });
  return Boolean(interviewExists);
};

const assertChatAccessForPair = async (currentUser: UserLite, otherUser: UserLite): Promise<void> => {
  if (currentUser._id.toString() === otherUser._id.toString()) {
    throw new ApplicationError(APPLICATION_MESSAGES.CHAT.SELF_CHAT_FORBIDDEN, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  const currentRole = currentUser.role;
  const otherRole = otherUser.role;

  const isCandidateHrPair =
    (currentRole === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE && otherRole === APPLICATION_CONSTANTS.USER_ROLES.HR) || 
    (currentRole === APPLICATION_CONSTANTS.USER_ROLES.HR && otherRole === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE);
  if (isCandidateHrPair) {
    return;
  }

  const isCandidateInterviewerPair =
    (currentRole === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE && otherRole === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) ||
    (currentRole === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER && otherRole === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE);
  if (isCandidateInterviewerPair) {
    const candidateId = currentRole === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE ? currentUser._id.toString() : otherUser._id.toString();
    const interviewerId = currentRole === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER ? currentUser._id.toString() : otherUser._id.toString();
    const canChat = await canCandidateTalkToInterviewer(candidateId, interviewerId);
    if (!canChat) {
      throw new ApplicationError(APPLICATION_MESSAGES.CHAT.CANDIDATE_INTERVIEWER_RESTRICTED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN);
    }
    return;
  }

  throw new ApplicationError(APPLICATION_MESSAGES.CHAT.ROLE_COMBINATION_FORBIDDEN, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN);
};

const getConversationOrThrow = async (conversationId: string, userId: string): Promise<ChatConversationLean> => {
  const conversation = await ChatConversationModel.findById(conversationId).lean<ChatConversationLean | null>();
  if (!conversation) {
    throw new ApplicationError(APPLICATION_MESSAGES.CHAT.CONVERSATION_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);
  }

  const participantIds = conversation.participants.map((participantId) => participantId.toString());
  if (!participantIds.includes(userId)) {
    throw new ApplicationError(APPLICATION_MESSAGES.CHAT.CONVERSATION_ACCESS_FORBIDDEN, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN);
  }

  return conversation;
};

const ensureDefaultConversationsForUser = async (currentUserId: string): Promise<void> => {
  const currentUser = await UserModel.findById(currentUserId).select("_id role isApproved").lean();
  if (!currentUser) {
    return;
  }

  if (currentUser.role === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    const hrUsers = await UserModel.find({ role: APPLICATION_CONSTANTS.USER_ROLES.HR, isApproved: true }).select("_id").lean();
    if (hrUsers.length === 0) {
      return;
    }

    await Promise.all(hrUsers.map((hr) => ensureConversationByParticipants([currentUserId, hr._id.toString()])));
    return;
  }

  if (currentUser.role === APPLICATION_CONSTANTS.USER_ROLES.HR) {
    const candidates = await UserModel.find({ role: APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE, isApproved: true }).select("_id").lean();
    if (candidates.length === 0) {
      return;
    }

    await Promise.all(
      candidates.map((candidate) => ensureConversationByParticipants([currentUserId, candidate._id.toString()]))
    );
    return;
  }

  if (currentUser.role === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) {
    const hrUsers = await UserModel.find({ role: APPLICATION_CONSTANTS.USER_ROLES.HR, isApproved: true }).select("_id").lean();
    if (hrUsers.length === 0) {
      return;
    }

    await Promise.all(hrUsers.map((hr) => ensureConversationByParticipants([currentUserId, hr._id.toString()])));
  }
};

const ensureConversationByParticipants = async (participantIds: string[]): Promise<PopulatedChatConversationLean> => {
  const objectIds = participantIds.map((id) => toObjectId(id));
  const existing = await ChatConversationModel.findOne({
    participants: {
      $all: objectIds,
      $size: objectIds.length,
    },
  })
    .populate("participants", "name email role")
    .lean<PopulatedChatConversationLean | null>();

  if (existing) {
    return existing;
  }

  try {
    const created = await ChatConversationModel.create({
      participants: objectIds,
      lastMessage: APPLICATION_CONSTANTS.EMPTY_STRING,
      lastMessageAt: null,
    });

    const populated = await ChatConversationModel.findById(created._id)
      .populate("participants", "name email role")
      .lean<PopulatedChatConversationLean | null>();
    if (!populated) {
      throw new ApplicationError(
        APPLICATION_MESSAGES.CHAT.CONVERSATION_NOT_FOUND,
        APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND
      );
    }
    return populated;
  } catch (_error) {
    const retry = await ChatConversationModel.findOne({
      participants: {
        $all: objectIds,
        $size: objectIds.length,
      },
    })
      .populate("participants", "name email role")
      .lean<PopulatedChatConversationLean | null>();
    if (!retry) {
      throw new ApplicationError(
        APPLICATION_MESSAGES.CHAT.CONVERSATION_NOT_FOUND,
        APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND
      );
    }
    return retry;
  }
};

const countUnreadForConversation = async (conversationId: string, userId: string): Promise<number> => {
  return ChatMessageModel.countDocuments({
    conversationId: toObjectId(conversationId),
    senderId: { $ne: toObjectId(userId) },
    seenBy: { $ne: toObjectId(userId) },
  });
};

export const listConversationsForUser = async (userId: string) => {
  await ensureDefaultConversationsForUser(userId);

  const conversations = await ChatConversationModel.find({
    participants: toObjectId(userId),
  })
    .populate("participants", "name email role")
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .lean<PopulatedChatConversationLean[]>();

  const formatted = await Promise.all(
    conversations.map(async (conversation) => {
      const participants = conversation.participants.map(toParticipantResponse);
      const unreadCount = await countUnreadForConversation(conversation._id.toString(), userId);
      return {
        _id: conversation._id.toString(),
        participants,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      };
    })
  );

  return formatted;
};

export const getOrCreateDirectConversation = async (currentUserId: string, participantId: string) => {
  const participantIds = normalizeParticipants([currentUserId, participantId]);
  if (participantIds.length !== 2) {
    throw new ApplicationError(APPLICATION_MESSAGES.CHAT.TWO_PARTICIPANTS_REQUIRED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  const users = await findUsersByIds(participantIds);
  const currentUser = users.find((user) => user._id.toString() === currentUserId);
  const otherUser = users.find((user) => user._id.toString() !== currentUserId);

  if (!currentUser || !otherUser) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CHAT.INVALID_PARTICIPANTS,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  await assertChatAccessForPair(currentUser, otherUser);

  const conversation = await ensureConversationByParticipants([currentUserId, participantId]);

  return {
    _id: conversation._id.toString(),
    participants: conversation.participants.map(toParticipantResponse),
    lastMessage: conversation.lastMessage,
    lastMessageAt: conversation.lastMessageAt,
    unreadCount: 0,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
};

export const startCandidateConversationWithAnyHr = async (candidateUserId: string) => {
  const candidate = await UserModel.findById(candidateUserId).select("_id role").lean();
  if (!candidate || candidate.role !== APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CHAT.ONLY_CANDIDATE_CAN_START_HR_CHAT,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN
    );
  }

  const hr = await UserModel.findOne({ role: APPLICATION_CONSTANTS.USER_ROLES.HR, isApproved: true }).select("_id").lean();
  if (!hr) {
    throw new ApplicationError(APPLICATION_MESSAGES.CHAT.HR_NOT_AVAILABLE, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);
  }

  return getOrCreateDirectConversation(candidateUserId, hr._id.toString());
};

export const getMessagesForConversation = async (conversationId: string, userId: string) => {
  await getConversationOrThrow(conversationId, userId);
  const messages = await ChatMessageModel.find({ conversationId: toObjectId(conversationId) })
    .populate("senderId", "name email role")
    .sort({ createdAt: 1 })
    .lean<PopulatedChatMessageLean[]>();

  return messages.map((message) => {
    return {
      _id: message._id.toString(),
      conversationId: message.conversationId.toString(),
      sender: {
        _id: message.senderId._id.toString(),
        name: message.senderId.name,
        email: message.senderId.email,
        role: message.senderId.role,
      },
      message: message.message,
      status: message.status,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  });
};

export const sendMessageToConversation = async (conversationId: string, userId: string, message: string) => {
  const conversation = await getConversationOrThrow(conversationId, userId);
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CHAT.MESSAGE_REQUIRED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  const participantIds = conversation.participants.map((participantId) => participantId.toString());
  const recipientIds = participantIds.filter((participantId) => participantId !== userId);

  const isAnyRecipientOnline = recipientIds.some((recipientId) => isUserOnline(recipientId));
  const createdMessage = await ChatMessageModel.create({
    conversationId: toObjectId(conversationId),
    senderId: toObjectId(userId),
    message: trimmedMessage,
    status: recipientIds.length > 0 ? (isAnyRecipientOnline ? CHAT_MESSAGE_STATUSES[1] : CHAT_MESSAGE_STATUSES[0]) : CHAT_MESSAGE_STATUSES[0],
    seenBy: [toObjectId(userId)],
  });

  await ChatConversationModel.findByIdAndUpdate(toObjectId(conversationId), {
    lastMessage: trimmedMessage,
    lastMessageAt: createdMessage.createdAt,
  });

  const populatedMessage = await ChatMessageModel.findById(createdMessage._id)
    .populate("senderId", "name email role")
    .lean<PopulatedChatMessageLean | null>();
  if (!populatedMessage) {
    throw new ApplicationError(APPLICATION_MESSAGES.CHAT.MESSAGE_SEND_FAILED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  const responseMessage = {
    _id: populatedMessage._id.toString(),
    conversationId: populatedMessage.conversationId.toString(),
    sender: {
      _id: populatedMessage.senderId._id.toString(),
      name: populatedMessage.senderId.name,
      email: populatedMessage.senderId.email,
      role: populatedMessage.senderId.role,
    },
    message: populatedMessage.message,
    status: populatedMessage.status,
    createdAt: populatedMessage.createdAt,
    updatedAt: populatedMessage.updatedAt,
  };

  const io = getSocketServer();
  if (io) {
    for (const participantId of participantIds) {
      io.to(buildUserRoom(participantId)).emit(APPLICATION_CONSTANTS.SOCKET_EVENTS.CHAT_MESSAGE, responseMessage);
    }

    for (const participantId of participantIds) {
      const unreadCount = await countUnreadForConversation(conversationId, participantId);
      io.to(buildUserRoom(participantId)).emit(APPLICATION_CONSTANTS.SOCKET_EVENTS.CONVERSATION_UPDATED, {
        conversationId,
        lastMessage: trimmedMessage,
        lastMessageAt: createdMessage.createdAt,
        unreadCount,
      });
    }
  }

  return responseMessage;
};

export const markConversationAsSeen = async (conversationId: string, userId: string) => {
  await getConversationOrThrow(conversationId, userId);

  await ChatMessageModel.updateMany(
    {
      conversationId: toObjectId(conversationId),
      senderId: { $ne: toObjectId(userId) },
      seenBy: { $ne: toObjectId(userId) },
    },
    {
      $addToSet: { seenBy: toObjectId(userId) },
      $set: { status: CHAT_MESSAGE_STATUSES[2] },
    }
  );

  const io = getSocketServer();
  if (io) {
    const conversation = await ChatConversationModel.findById(toObjectId(conversationId)).lean<ChatConversationLean | null>();
    if (!conversation) {
      throw new ApplicationError(
        APPLICATION_MESSAGES.CHAT.CONVERSATION_NOT_FOUND,
        APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND
      );
    }

    const participantIds = conversation.participants.map((participantId) => participantId.toString());
    for (const participantId of participantIds) {
      const unreadCount = await countUnreadForConversation(conversationId, participantId);
      io.to(buildUserRoom(participantId)).emit(APPLICATION_CONSTANTS.SOCKET_EVENTS.CONVERSATION_UPDATED, {
        conversationId,
        unreadCount,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
      });
    }

    io.to(buildUserRoom(userId)).emit(APPLICATION_CONSTANTS.SOCKET_EVENTS.CHAT_SEEN, { conversationId });
  }
};

export const ensureCandidateInterviewerConversation = async (candidateId: string, interviewerId: string) => {
  const conversation = await ensureConversationByParticipants([candidateId, interviewerId]);

  const io = getSocketServer();
  if (io) {
    io.to(buildUserRoom(candidateId)).emit(APPLICATION_CONSTANTS.SOCKET_EVENTS.CONVERSATION_CREATED, { conversationId: conversation._id.toString() });
    io.to(buildUserRoom(interviewerId)).emit(APPLICATION_CONSTANTS.SOCKET_EVENTS.CONVERSATION_CREATED, { conversationId: conversation._id.toString() });
  }
};
