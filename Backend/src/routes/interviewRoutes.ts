import { Router } from "express";
import {
  cancelInterviewHandler,
  getCandidateInterviewsHandler,
  getHrInterviewsHandler,
  getInterviewerInterviewsHandler,
  getInterviewerAvailabilityHandler,
  scheduleInterviewHandler,
} from "../controllers/interviewController";
import { INTERVIEW_ROUTES, ROUTE_ROLE_GROUPS } from "../utils/constants/routeConstants";
import { asyncHandler } from "../utils/helpers/asyncHandler";
import { withAuthorizedRoles } from "../utils/helpers";

const interviewRouter = Router();

interviewRouter.get(
  INTERVIEW_ROUTES.HR_INTERVIEWS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(getHrInterviewsHandler)
);
interviewRouter.post(
  INTERVIEW_ROUTES.SCHEDULE,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(scheduleInterviewHandler)
);
interviewRouter.patch(
  INTERVIEW_ROUTES.CANCEL,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(cancelInterviewHandler)
);
interviewRouter.get(
  INTERVIEW_ROUTES.AVAILABILITY,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(getInterviewerAvailabilityHandler)
);
interviewRouter.get(
  INTERVIEW_ROUTES.CANDIDATE_INTERVIEWS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CANDIDATE_ONLY),
  asyncHandler(getCandidateInterviewsHandler)
);
interviewRouter.get(
  INTERVIEW_ROUTES.INTERVIEWER_INTERVIEWS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.INTERVIEWER_ONLY),
  asyncHandler(getInterviewerInterviewsHandler)
);

export default interviewRouter;
