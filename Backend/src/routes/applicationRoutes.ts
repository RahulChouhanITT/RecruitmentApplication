import { Router } from "express";
import { scheduleInterviewHandler, updateApplicationStatusHandler } from "../controllers/applicationController";
import { APPLICATION_ROUTES, ROUTE_ROLE_GROUPS } from "../utils/constants/routeConstants";
import { asyncHandler } from "../utils/helpers/asyncHandler";
import { withAuthorizedRoles } from "../utils/helpers";

const applicationRouter = Router();

applicationRouter.patch(
  APPLICATION_ROUTES.UPDATE_STATUS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(updateApplicationStatusHandler)
);

applicationRouter.post(
  APPLICATION_ROUTES.SCHEDULE_INTERVIEW,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(scheduleInterviewHandler)
);

export default applicationRouter;
