import { Router } from 'express';
import {
  applyForJob,
  getJobsForCandidate,
  getMyApplications,
} from '../controllers/candidateController';
import {
  activateJob,
  closeJob,
  createJob,
  getJobsForHr,
  updateJob,
} from '../controllers/jobController';
import { getApplicationsForHrJob } from '../controllers/applicationController';
import { JOB_ROUTES, ROUTE_ROLE_GROUPS } from '../utils/constants/routeConstants';
import { asyncHandler } from '../utils/http/asyncHandler';
import { withAuthorizedRoles } from '../middleware/routeAuthorizationHelpers';

const jobRouter = Router();

jobRouter.get(
  JOB_ROUTES.ROOT,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CANDIDATE_ONLY),
  asyncHandler(getJobsForCandidate),
);
jobRouter.get(
  JOB_ROUTES.MY_JOBS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(getJobsForHr),
);
jobRouter.get(
  JOB_ROUTES.APPLIED_JOBS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CANDIDATE_ONLY),
  asyncHandler(getMyApplications),
);
jobRouter.post(
  JOB_ROUTES.ROOT,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(createJob),
);
jobRouter.put(
  JOB_ROUTES.UPDATE_JOB,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(updateJob),
);
jobRouter.get(
  JOB_ROUTES.JOB_APPLICATIONS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(getApplicationsForHrJob),
);
jobRouter.patch(
  JOB_ROUTES.CLOSE_JOB,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(closeJob),
);
jobRouter.patch(
  JOB_ROUTES.ACTIVATE_JOB,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(activateJob),
);
jobRouter.post(
  JOB_ROUTES.APPLY_FOR_JOB,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CANDIDATE_ONLY),
  asyncHandler(applyForJob),
);

export default jobRouter;
