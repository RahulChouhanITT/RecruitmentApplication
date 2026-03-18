import { Router } from "express";
import {
  login,
  logout,
  me,
  pendingApprovals,
  completeProfile,
  getProfile,
  interviewers,
  register,
  resendOtp,
  updateProfile,
  updateApprovalStatus,
  verifyEmail,
} from "../controllers/authController";
import { AUTH_ROUTES, ROUTE_ROLE_GROUPS } from "../utils/constants/routeConstants";
import { asyncHandler } from "../utils/http/asyncHandler";
import { withAuthorizedRoles } from "../utils";

const authRouter = Router();

authRouter.post(AUTH_ROUTES.REGISTER, asyncHandler(register));
authRouter.post(AUTH_ROUTES.LOGIN, asyncHandler(login));
authRouter.post(AUTH_ROUTES.VERIFY_EMAIL, asyncHandler(verifyEmail));
authRouter.post(AUTH_ROUTES.RESEND_OTP, asyncHandler(resendOtp));
authRouter.post(AUTH_ROUTES.LOGOUT, asyncHandler(logout));
authRouter.get(
  AUTH_ROUTES.ME,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CHAT_ALLOWED),
  asyncHandler(me)
);
authRouter.get(
  AUTH_ROUTES.PROFILE,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CHAT_ALLOWED),
  asyncHandler(getProfile)
);
authRouter.put(
  AUTH_ROUTES.PROFILE,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CHAT_ALLOWED),
  asyncHandler(updateProfile)
);
authRouter.put(
  AUTH_ROUTES.COMPLETE_PROFILE,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CHAT_ALLOWED),
  asyncHandler(completeProfile)
);
authRouter.get(
  AUTH_ROUTES.INTERVIEWERS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(interviewers)
);
authRouter.get(
  AUTH_ROUTES.PENDING_APPROVALS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(pendingApprovals)
);
authRouter.put(
  AUTH_ROUTES.UPDATE_APPROVAL,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(updateApprovalStatus)
);

export default authRouter;
