import { Router } from "express";
import {
  login,
  logout,
  me,
  pendingApprovals,
  completeProfile,
  register,
  resendOtp,
  updateApprovalStatus,
  verifyEmail,
} from "../controllers/authController";
import { authenticationMiddleware } from "../middleware/authenticationMiddleware";
import { authorizeRoles } from "../middleware/authorizationMiddleware";
import { asyncHandler } from "../utils/helpers/asyncHandler";

const authRouter = Router();

authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login));
authRouter.post("/verify-email", asyncHandler(verifyEmail));
authRouter.post("/resend-otp", asyncHandler(resendOtp));
authRouter.post("/logout", asyncHandler(logout));
authRouter.get("/me", authenticationMiddleware, asyncHandler(me));
authRouter.put("/profile/complete", authenticationMiddleware, asyncHandler(completeProfile));
authRouter.get(
  "/pending-approvals",
  authenticationMiddleware,
  authorizeRoles(["hr"]),
  asyncHandler(pendingApprovals)
);
authRouter.put(
  "/approvals/:userId",
  authenticationMiddleware,
  authorizeRoles(["hr"]),
  asyncHandler(updateApprovalStatus)
);

export default authRouter;
