import { Router } from "express";
import {
  activateJobHandler,
  applyForJobHandler,
  closeJobHandler,
  createJobHandler,
  getAppliedJobsHandler,
  getApplicationsForHrJobHandler,
  getJobsForCandidateHandler,
  getJobsForHrHandler,
  updateJobHandler,
} from "../controllers/jobController";
import { JOB_ROUTES, ROUTE_ROLE_GROUPS } from "../utils/constants/routeConstants";
import { asyncHandler } from "../utils/http/asyncHandler";
import { withAuthorizedRoles } from "../utils";

const jobRouter = Router();

jobRouter.get(
  JOB_ROUTES.ROOT,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CANDIDATE_ONLY),
  asyncHandler(getJobsForCandidateHandler)
);
jobRouter.get(
  JOB_ROUTES.MY_JOBS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(getJobsForHrHandler)
);
jobRouter.get(
  JOB_ROUTES.APPLIED_JOBS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CANDIDATE_ONLY),
  asyncHandler(getAppliedJobsHandler)
);
jobRouter.post(
  JOB_ROUTES.ROOT,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(createJobHandler)
);
jobRouter.put(
  JOB_ROUTES.UPDATE_JOB,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(updateJobHandler)
);
jobRouter.get(
  JOB_ROUTES.JOB_APPLICATIONS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(getApplicationsForHrJobHandler)
);
jobRouter.patch(
  JOB_ROUTES.CLOSE_JOB,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(closeJobHandler)
);
jobRouter.patch(
  JOB_ROUTES.ACTIVATE_JOB,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(activateJobHandler)
);
jobRouter.post(
  JOB_ROUTES.APPLY_FOR_JOB,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CANDIDATE_ONLY),
  asyncHandler(applyForJobHandler)
);

export default jobRouter;
