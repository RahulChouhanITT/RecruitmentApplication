import { Router } from "express";
import { updateApplicationStatusHandler } from "../controllers/applicationController";
import { APPLICATION_ROUTES, ROUTE_ROLE_GROUPS } from "../utils/constants/routeConstants";
import { asyncHandler } from "../utils/http/asyncHandler";
import { withAuthorizedRoles } from "../utils";

const applicationRouter = Router();

applicationRouter.patch(
  APPLICATION_ROUTES.UPDATE_STATUS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(updateApplicationStatusHandler)
);

export default applicationRouter;
