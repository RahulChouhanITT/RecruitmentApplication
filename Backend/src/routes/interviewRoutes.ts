import { Router } from 'express';
import { getMyInterviews } from '../controllers/candidateController';
import {
  cancelInterview,
  getHrInterviews,
  getInterviewerAvailability,
  getInterviewerInterviews,
  scheduleInterview,
} from '../controllers/interviewController';
import { INTERVIEW_ROUTES, ROUTE_ROLE_GROUPS } from '../utils/constants/routeConstants';
import { asyncHandler } from '../utils/http/asyncHandler';
import { withAuthorizedRoles } from '../middleware/routeAuthorizationHelpers';

const interviewRouter = Router();

interviewRouter.get(
  INTERVIEW_ROUTES.HR_INTERVIEWS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(getHrInterviews),
);
interviewRouter.post(
  INTERVIEW_ROUTES.SCHEDULE,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(scheduleInterview),
);
interviewRouter.patch(
  INTERVIEW_ROUTES.CANCEL,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(cancelInterview),
);
interviewRouter.get(
  INTERVIEW_ROUTES.AVAILABILITY,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(getInterviewerAvailability),
);
interviewRouter.get(
  INTERVIEW_ROUTES.CANDIDATE_INTERVIEWS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CANDIDATE_ONLY),
  asyncHandler(getMyInterviews),
);
interviewRouter.get(
  INTERVIEW_ROUTES.INTERVIEWER_INTERVIEWS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.INTERVIEWER_ONLY),
  asyncHandler(getInterviewerInterviews),
);

export default interviewRouter;
