import { Router } from 'express';
import {
  createDirectConversation,
  getConversationMessages,
  getConversations,
  markConversationSeen,
  sendConversationMessage,
  startCandidateHrConversation,
} from '../controllers/chatController';
import { CHAT_ROUTES, ROUTE_ROLE_GROUPS } from '../utils/constants/routeConstants';
import { asyncHandler } from '../utils/http/asyncHandler';
import { withAuthorizedRoles } from '../middleware/routeAuthorizationHelpers';

const chatRouter = Router();

chatRouter.use(...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CHAT_ALLOWED));

chatRouter.get(CHAT_ROUTES.CONVERSATIONS, asyncHandler(getConversations));
chatRouter.post(CHAT_ROUTES.DIRECT_CONVERSATION, asyncHandler(createDirectConversation));
chatRouter.post(
  CHAT_ROUTES.START_CANDIDATE_HR_CONVERSATION,
  asyncHandler(startCandidateHrConversation),
);
chatRouter.get(CHAT_ROUTES.CONVERSATION_MESSAGES, asyncHandler(getConversationMessages));
chatRouter.post(CHAT_ROUTES.CONVERSATION_MESSAGES, asyncHandler(sendConversationMessage));
chatRouter.patch(CHAT_ROUTES.MARK_CONVERSATION_SEEN, asyncHandler(markConversationSeen));

export default chatRouter;
