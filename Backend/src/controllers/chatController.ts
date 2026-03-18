import type { Request, Response } from "express";
import {
  getMessagesForConversation,
  getOrCreateDirectConversation,
  listConversationsForUser,
  markConversationAsSeen,
  startCandidateConversationWithAnyHr,
  sendMessageToConversation,
} from "../services/chatService";
import { APPLICATION_CONSTANTS } from "../utils/constants/applicationConstants";
import { sendSuccessResponse } from "../utils";
import { APPLICATION_MESSAGES } from "../utils/messages/applicationMessages";
import type { AuthenticatedRequest } from "../utils/types/authTypes";
import type { DirectConversationRequest, SendMessageRequest } from "../utils/types/chatTypes";

export const getConversationsHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const conversations = await listConversationsForUser(req.authenticatedUserId as string);
  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.CHAT.CONVERSATIONS_FETCHED_SUCCESS,
    data: conversations,
  });
};

export const createDirectConversationHandler = async (
  req: AuthenticatedRequest & Request<unknown, unknown, DirectConversationRequest>,
  res: Response
): Promise<void> => {
  const conversation = await getOrCreateDirectConversation(req.authenticatedUserId as string, req.body.participantId);
  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.CHAT.CONVERSATION_READY,
    data: conversation,
  });
};

export const startCandidateHrConversationHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const conversation = await startCandidateConversationWithAnyHr(req.authenticatedUserId as string);
  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.CHAT.CONVERSATION_READY,
    data: conversation,
  });
};

export const getConversationMessagesHandler = async (req: AuthenticatedRequest & Request, res: Response): Promise<void> => {
  const { conversationId } = req.params as { conversationId: string };
  const messages = await getMessagesForConversation(conversationId, req.authenticatedUserId as string);
  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.CHAT.MESSAGES_FETCHED_SUCCESS,
    data: messages,
  });
};

export const sendConversationMessageHandler = async (
  req: AuthenticatedRequest & Request,
  res: Response
): Promise<void> => {
  const { conversationId } = req.params as { conversationId: string };
  const requestBody = req.body as SendMessageRequest;
  const sentMessage = await sendMessageToConversation(
    conversationId,
    req.authenticatedUserId as string,
    requestBody.message
  );
  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CREATED,
    message: APPLICATION_MESSAGES.CHAT.MESSAGE_SENT_SUCCESS,
    data: sentMessage,
  });
};

export const markConversationSeenHandler = async (req: AuthenticatedRequest & Request, res: Response): Promise<void> => {
  const { conversationId } = req.params as { conversationId: string };
  await markConversationAsSeen(conversationId, req.authenticatedUserId as string);
  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.CHAT.CONVERSATION_MARKED_SEEN,
  });
};
