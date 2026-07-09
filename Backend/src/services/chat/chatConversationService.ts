import { ChatConversationModel } from '../../models/chatConversationModel';
import { ChatMessageModel } from '../../models/chatMessageModel';
import { InterviewModel } from '../../models/interviewModel';
import { UserModel } from '../../models/userModel';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import {
  CHAT_ENTITY_ID_FIELD,
  CHAT_PARTICIPANT_POPULATION_FIELDS,
  CHAT_USER_LITE_FIELDS,
  CHAT_USER_PRESENCE_FIELDS,
  CHAT_USER_ROLE_FIELDS,
} from '../../utils/constants';
import {
  type ChatRealtimePayload,
  type PopulatedChatConversationLean,
  type UserLite,
  type ServiceResult,
} from '../../utils/types';
import {
  isCandidateHrRolePair,
  isCandidateInterviewerRolePair,
  isHrInterviewerRolePair,
  normalizeConversationParticipants,
  toChatConversationResponse,
  toObjectId,
} from './helpers/chatServiceHelpers';

const findUsersByIds = async (userIds: string[]): Promise<UserLite[]> => {
  const users = await UserModel.find({ _id: { $in: userIds } })
    .select(CHAT_USER_LITE_FIELDS)
    .lean<UserLite[]>();

  if (users.length !== userIds.length) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CHAT.USERS_NOT_FOUND,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  return users;
};

const findCandidateInterviewerInterview = async (candidateId: string, interviewerId: string) => {
  return InterviewModel.exists({
    candidateId: toObjectId(candidateId),
    interviewerId: toObjectId(interviewerId),
  });
};

const assertChatAccessForPair = async (
  currentUser: UserLite,
  otherUser: UserLite,
): Promise<void> => {
  if (currentUser._id.toString() === otherUser._id.toString()) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CHAT.SELF_CHAT_FORBIDDEN,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  const currentRole = currentUser.role;
  const otherRole = otherUser.role;

  if (isCandidateHrRolePair(currentRole, otherRole)) {
    return;
  }

  if (isHrInterviewerRolePair(currentRole, otherRole)) {
    return;
  }

  if (isCandidateInterviewerRolePair(currentRole, otherRole)) {
    const candidateId =
      currentRole === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE
        ? currentUser._id.toString()
        : otherUser._id.toString();
    const interviewerId =
      currentRole === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER
        ? currentUser._id.toString()
        : otherUser._id.toString();
    const canChat = await findCandidateInterviewerInterview(candidateId, interviewerId);

    if (!canChat) {
      throw new ApplicationError(
        APPLICATION_MESSAGES.CHAT.CANDIDATE_INTERVIEWER_RESTRICTED,
        APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN,
      );
    }

    return;
  }

  throw new ApplicationError(
    APPLICATION_MESSAGES.CHAT.ROLE_COMBINATION_FORBIDDEN,
    APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN,
  );
};

const findConversationByParticipants = async (
  participantIds: string[],
): Promise<PopulatedChatConversationLean | null> => {
  const objectIds = participantIds.map((id) => toObjectId(id));

  return ChatConversationModel.findOne({
    participants: {
      $all: objectIds,
      $size: objectIds.length,
    },
  })
    .populate('participants', CHAT_PARTICIPANT_POPULATION_FIELDS)
    .lean<PopulatedChatConversationLean | null>();
};

const createConversationRecord = async (participantIds: string[]) => {
  return ChatConversationModel.create({
    participants: participantIds.map((id) => toObjectId(id)),
    lastMessage: APPLICATION_CONSTANTS.EMPTY_STRING,
    lastMessageAt: null,
  });
};

const findConversationByIdWithParticipants = async (conversationId: string) => {
  return ChatConversationModel.findById(conversationId)
    .populate('participants', CHAT_PARTICIPANT_POPULATION_FIELDS)
    .lean<PopulatedChatConversationLean | null>();
};

const ensureConversationByParticipants = async (
  participantIds: string[],
): Promise<PopulatedChatConversationLean> => {
  const existingConversation = await findConversationByParticipants(participantIds);
  if (existingConversation) {
    return existingConversation;
  }

  try {
    const createdConversation = await createConversationRecord(participantIds);
    const populatedConversation = await findConversationByIdWithParticipants(
      createdConversation._id.toString(),
    );

    if (!populatedConversation) {
      throw new ApplicationError(
        APPLICATION_MESSAGES.CHAT.CONVERSATION_NOT_FOUND,
        APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
      );
    }

    return populatedConversation;
  } catch {
    const retryConversation = await findConversationByParticipants(participantIds);
    if (!retryConversation) {
      throw new ApplicationError(
        APPLICATION_MESSAGES.CHAT.CONVERSATION_NOT_FOUND,
        APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
      );
    }

    return retryConversation;
  }
};

const ensureDefaultConversationsForUser = async (currentUserId: string): Promise<void> => {
  const currentUser = await UserModel.findById(currentUserId)
    .select(CHAT_USER_PRESENCE_FIELDS)
    .lean();
  if (!currentUser) {
    return;
  }

  if (currentUser.role === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    const hrUsers = await UserModel.find({
      role: APPLICATION_CONSTANTS.USER_ROLES.HR,
      isApproved: true,
    })
      .select(CHAT_ENTITY_ID_FIELD)
      .lean();

    if (hrUsers.length === 0) {
      return;
    }

    await Promise.all(
      hrUsers.map((hr) => ensureConversationByParticipants([currentUserId, hr._id.toString()])),
    );
    return;
  }

  if (currentUser.role === APPLICATION_CONSTANTS.USER_ROLES.HR) {
    const candidates = await UserModel.find({
      role: APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE,
      isApproved: true,
    })
      .select(CHAT_ENTITY_ID_FIELD)
      .lean();

    if (candidates.length === 0) {
      return;
    }

    await Promise.all(
      candidates.map((candidate) =>
        ensureConversationByParticipants([currentUserId, candidate._id.toString()]),
      ),
    );
    return;
  }

  if (currentUser.role === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) {
    const hrUsers = await UserModel.find({
      role: APPLICATION_CONSTANTS.USER_ROLES.HR,
      isApproved: true,
    })
      .select(CHAT_ENTITY_ID_FIELD)
      .lean();

    if (hrUsers.length === 0) {
      return;
    }

    await Promise.all(
      hrUsers.map((hr) => ensureConversationByParticipants([currentUserId, hr._id.toString()])),
    );
  }
};

const countUnreadForConversation = async (
  conversationId: string,
  userId: string,
): Promise<number> => {
  return ChatMessageModel.countDocuments({
    conversationId: toObjectId(conversationId),
    senderId: { $ne: toObjectId(userId) },
    seenBy: { $ne: toObjectId(userId) },
  });
};

const findConversationsForUser = async (userId: string) => {
  return ChatConversationModel.find({
    participants: toObjectId(userId),
  })
    .populate('participants', CHAT_PARTICIPANT_POPULATION_FIELDS)
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .lean<PopulatedChatConversationLean[]>();
};

export const listConversationsForUser = async (userId: string) => {
  await ensureDefaultConversationsForUser(userId);

  const conversations = await findConversationsForUser(userId);

  return Promise.all(
    conversations.map(async (conversation) => {
      const unreadCount = await countUnreadForConversation(conversation._id.toString(), userId);
      return toChatConversationResponse(conversation, unreadCount);
    }),
  );
};

export const getOrCreateDirectConversation = async (
  currentUserId: string,
  participantId: string,
) => {
  const participantIds = normalizeConversationParticipants([currentUserId, participantId]);

  if (participantIds.length !== 2) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CHAT.TWO_PARTICIPANTS_REQUIRED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  const users = await findUsersByIds(participantIds);
  const currentUser = users.find((user) => user._id.toString() === currentUserId);
  const otherUser = users.find((user) => user._id.toString() !== currentUserId);

  if (!currentUser || !otherUser) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CHAT.INVALID_PARTICIPANTS,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  await assertChatAccessForPair(currentUser, otherUser);

  const conversation = await ensureConversationByParticipants([currentUserId, participantId]);
  return toChatConversationResponse(conversation, 0);
};

export const startCandidateConversationWithAnyHr = async (candidateUserId: string) => {
  const candidate = await UserModel.findById(candidateUserId).select(CHAT_USER_ROLE_FIELDS).lean();

  if (!candidate || candidate.role !== APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CHAT.ONLY_CANDIDATE_CAN_START_HR_CHAT,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN,
    );
  }

  const hr = await UserModel.findOne({
    role: APPLICATION_CONSTANTS.USER_ROLES.HR,
    isApproved: true,
  })
    .select(CHAT_ENTITY_ID_FIELD)
    .lean();

  if (!hr) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CHAT.HR_NOT_AVAILABLE,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  return getOrCreateDirectConversation(candidateUserId, hr._id.toString());
};

export const ensureCandidateInterviewerConversation = async (
  candidateId: string,
  interviewerId: string,
): Promise<ServiceResult<PopulatedChatConversationLean, null, null, ChatRealtimePayload>> => {
  const conversation = await ensureConversationByParticipants([candidateId, interviewerId]);

  return {
    data: conversation,
    realtimePayload: {
      kind: 'conversationCreated',
      participantIds: [candidateId, interviewerId],
      conversationId: conversation._id.toString(),
    },
  };
};
