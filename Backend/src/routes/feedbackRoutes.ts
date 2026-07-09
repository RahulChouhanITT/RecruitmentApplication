import { Router } from 'express';
import { getHrInterviewFeedback, submitInterviewFeedback } from '../controllers/feedbackController';
import { FEEDBACK_ROUTES, ROUTE_ROLE_GROUPS } from '../utils/constants/routeConstants';
import { asyncHandler } from '../utils/http/asyncHandler';
import { withAuthorizedRoles } from '../middleware/routeAuthorizationHelpers';

const feedbackRouter = Router();

feedbackRouter.post(
  FEEDBACK_ROUTES.SUBMIT,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.INTERVIEWER_ONLY),
  asyncHandler(submitInterviewFeedback),
);

feedbackRouter.get(
  FEEDBACK_ROUTES.HR_INTERVIEW_FEEDBACK,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(getHrInterviewFeedback),
);

export default feedbackRouter;
