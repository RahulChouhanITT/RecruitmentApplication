import type { Request, Response } from 'express';
import {
  getOrCreateDirectConversation as getOrCreateDirectConversationService,
  listConversationsForUser as listConversationsForUserService,
  startCandidateConversationWithAnyHr as startCandidateConversationWithAnyHrService,
} from '../services/chat/chatConversationService';
import {
  getMessagesForConversation as getMessagesForConversationService,
  markConversationAsSeen as markConversationAsSeenService,
  sendMessageToConversation as sendMessageToConversationService,
} from '../services/chat/chatMessageService';
import { dispatchChatRealtime } from '../services/chat/chatRealtimePublisher';
import { sendSuccessResponse } from '../utils/http/responseHelpers';
import { getAuthenticatedUserId } from './helpers/requestAuthHelpers';
import { APPLICATION_CONSTANTS } from '../utils/constants/applicationConstants';
import { APPLICATION_MESSAGES } from '../utils/messages/applicationMessages';
import type { AuthenticatedRequest } from '../utils/types/authTypes';
import type { DirectConversationRequest, SendMessageRequest } from '../utils/types/chatTypes';

export const getConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const conversations = await listConversationsForUserService(authenticatedUserId);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.CHAT.CONVERSATIONS_FETCHED_SUCCESS,
    data: conversations,
  });
};

export const createDirectConversation = async (
  req: AuthenticatedRequest & Request<unknown, unknown, DirectConversationRequest>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const { participantId } = req.body;
  const conversation = await getOrCreateDirectConversationService(
    authenticatedUserId,
    participantId,
  );

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.CHAT.CONVERSATION_READY,
    data: conversation,
  });
};

export const startCandidateHrConversation = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const conversation = await startCandidateConversationWithAnyHrService(authenticatedUserId);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.CHAT.CONVERSATION_READY,
    data: conversation,
  });
};

export const getConversationMessages = async (
  req: AuthenticatedRequest & Request<{ conversationId: string }>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const { conversationId } = req.params;
  const messages = await getMessagesForConversationService(conversationId, authenticatedUserId);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.CHAT.MESSAGES_FETCHED_SUCCESS,
    data: messages,
  });
};

export const sendConversationMessage = async (
  req: AuthenticatedRequest & Request<{ conversationId: string }, unknown, SendMessageRequest>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const { conversationId } = req.params;
  const { message } = req.body;
  const sentMessageResult = await sendMessageToConversationService(
    conversationId,
    authenticatedUserId,
    message,
  );
  await dispatchChatRealtime(sentMessageResult.realtimePayload);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CREATED,
    message: APPLICATION_MESSAGES.CHAT.MESSAGE_SENT_SUCCESS,
    data: sentMessageResult.data,
  });
};

export const markConversationSeen = async (
  req: AuthenticatedRequest & Request<{ conversationId: string }>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const { conversationId } = req.params;
  const seenResult = await markConversationAsSeenService(conversationId, authenticatedUserId);
  await dispatchChatRealtime(seenResult.realtimePayload);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.CHAT.CONVERSATION_MARKED_SEEN,
  });
};
