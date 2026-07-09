import { Router } from 'express';
import multer from 'multer';
import { deleteResume, uploadResume } from '../controllers/candidateController';
import {
  CANDIDATE_ROUTES,
  ROUTE_FIELD_NAMES,
  ROUTE_ROLE_GROUPS,
} from '../utils/constants/routeConstants';
import { asyncHandler } from '../utils/http/asyncHandler';
import { withAuthorizedRoles } from '../middleware/routeAuthorizationHelpers';

const candidateRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
});

candidateRouter.post(
  CANDIDATE_ROUTES.RESUME,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CANDIDATE_ONLY),
  upload.single(ROUTE_FIELD_NAMES.RESUME),
  asyncHandler(uploadResume),
);

candidateRouter.delete(
  CANDIDATE_ROUTES.RESUME,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CANDIDATE_ONLY),
  asyncHandler(deleteResume),
);

export default candidateRouter;
