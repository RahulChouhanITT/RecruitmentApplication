import { Router } from 'express';
import {
  handleGoogleLoginCallback,
  loginUser,
  logoutUser,
  registerUser,
  resendEmailOtp,
  startGoogleLogin,
  verifyEmailOtp,
} from '../controllers/authController';
import {
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  completeUserProfile,
} from '../controllers/userController';
import {
  getApprovedInterviewers,
  getPendingApprovalUsers,
  updateUserApprovalStatus,
} from '../controllers/adminController';
import { CONFIGURATION_CONSTANTS } from '../utils/constants/configurationConstants';
import { AUTH_ROUTES, ROUTE_ROLE_GROUPS } from '../utils/constants/routeConstants';
import { asyncHandler } from '../utils/http/asyncHandler';
import { withAuthorizedRoles } from '../middleware/routeAuthorizationHelpers';
import { createSlidingWindowRateLimiter } from '../middleware/rateLimitMiddleware';

const authRouter = Router();
const authWriteRateLimiter = createSlidingWindowRateLimiter({
  ...CONFIGURATION_CONSTANTS.RATE_LIMIT.POLICIES.AUTH_WRITE,
  keyPrefix: CONFIGURATION_CONSTANTS.RATE_LIMIT.KEY_PREFIXES.AUTH_WRITE,
});
const authOtpRateLimiter = createSlidingWindowRateLimiter({
  ...CONFIGURATION_CONSTANTS.RATE_LIMIT.POLICIES.AUTH_OTP,
  keyPrefix: CONFIGURATION_CONSTANTS.RATE_LIMIT.KEY_PREFIXES.AUTH_OTP,
});

authRouter.post(AUTH_ROUTES.REGISTER, authWriteRateLimiter, asyncHandler(registerUser));
authRouter.post(AUTH_ROUTES.LOGIN, authWriteRateLimiter, asyncHandler(loginUser));
authRouter.get(AUTH_ROUTES.GOOGLE, authWriteRateLimiter, asyncHandler(startGoogleLogin));
authRouter.get(
  AUTH_ROUTES.GOOGLE_CALLBACK,
  authWriteRateLimiter,
  asyncHandler(handleGoogleLoginCallback),
);
authRouter.post(AUTH_ROUTES.VERIFY_EMAIL, authOtpRateLimiter, asyncHandler(verifyEmailOtp));
authRouter.post(AUTH_ROUTES.RESEND_OTP, authOtpRateLimiter, asyncHandler(resendEmailOtp));
authRouter.post(AUTH_ROUTES.LOGOUT, asyncHandler(logoutUser));
authRouter.get(
  AUTH_ROUTES.ME,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CHAT_ALLOWED),
  asyncHandler(getCurrentUser),
);
authRouter.get(
  AUTH_ROUTES.PROFILE,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CHAT_ALLOWED),
  asyncHandler(getUserProfile),
);
authRouter.put(
  AUTH_ROUTES.PROFILE,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CHAT_ALLOWED),
  asyncHandler(updateUserProfile),
);
authRouter.put(
  AUTH_ROUTES.COMPLETE_PROFILE,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CHAT_ALLOWED),
  asyncHandler(completeUserProfile),
);
authRouter.get(
  AUTH_ROUTES.INTERVIEWERS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(getApprovedInterviewers),
);
authRouter.get(
  AUTH_ROUTES.PENDING_APPROVALS,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(getPendingApprovalUsers),
);
authRouter.put(
  AUTH_ROUTES.UPDATE_APPROVAL,
  ...withAuthorizedRoles(ROUTE_ROLE_GROUPS.HR_ONLY),
  asyncHandler(updateUserApprovalStatus),
);

export default authRouter;
