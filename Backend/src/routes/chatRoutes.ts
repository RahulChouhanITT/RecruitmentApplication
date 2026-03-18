import { Router } from "express";
import {
  createDirectConversationHandler,
  getConversationMessagesHandler,
  getConversationsHandler,
  markConversationSeenHandler,
  startCandidateHrConversationHandler,
  sendConversationMessageHandler,
} from "../controllers/chatController";
import { CHAT_ROUTES, ROUTE_ROLE_GROUPS } from "../utils/constants/routeConstants";
import { asyncHandler } from "../utils/http/asyncHandler";
import { withAuthorizedRoles } from "../utils";

const chatRouter = Router();

chatRouter.use(...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CHAT_ALLOWED));

chatRouter.get(CHAT_ROUTES.CONVERSATIONS, asyncHandler(getConversationsHandler));
chatRouter.post(
  CHAT_ROUTES.DIRECT_CONVERSATION,
  asyncHandler(createDirectConversationHandler)
);
chatRouter.post(
  CHAT_ROUTES.START_CANDIDATE_HR_CONVERSATION,
  asyncHandler(startCandidateHrConversationHandler)
);
chatRouter.get(
  CHAT_ROUTES.CONVERSATION_MESSAGES,
  asyncHandler(getConversationMessagesHandler)
);
chatRouter.post(
  CHAT_ROUTES.CONVERSATION_MESSAGES,
  asyncHandler(sendConversationMessageHandler)
);
chatRouter.patch(
  CHAT_ROUTES.MARK_CONVERSATION_SEEN,
  asyncHandler(markConversationSeenHandler)
);

export default chatRouter;
