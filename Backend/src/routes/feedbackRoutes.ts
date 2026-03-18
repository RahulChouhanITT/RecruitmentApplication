import { Router } from "express";
import { getHrInterviewFeedbackHandler, submitInterviewFeedbackHandler } from "../controllers/feedbackController";
import { FEEDBACK_ROUTES, ROUTE_ROLE_GROUPS } from "../utils/constants/routeConstants";
import { asyncHandler } from "../utils/http/asyncHandler";
import { withAuthorizedRoles } from "../utils";

const feedbackRouter = Router();

feedbackRouter.post(
  FEEDBACK_ROUTES.SUBMIT,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.INTERVIEWER_ONLY),
  asyncHandler(submitInterviewFeedbackHandler)
);

feedbackRouter.get(
  FEEDBACK_ROUTES.HR_INTERVIEW_FEEDBACK,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(getHrInterviewFeedbackHandler)
);

export default feedbackRouter;
