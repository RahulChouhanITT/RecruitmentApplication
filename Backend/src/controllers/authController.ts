import type { Request, Response } from "express";
import { APPLICATION_CONSTANTS } from "../utils/constants/applicationConstants";
import { APPLICATION_MESSAGES } from "../utils/messages/applicationMessages";
import { generateAuthenticationToken } from "../utils/tokenUtility";
import {
  completeUserProfile,
  getPendingApprovalUsers,
  getCurrentUser,
  loginUser,
  registerUser,
  resendEmailOtp,
  updateApprovalStatusForUser,
  verifyEmailOtp,
} from "../services/authService";
import type { AuthenticatedRequest } from "../middleware/authenticationMiddleware";
import type {
  CompleteProfileRequestBody,
  LoginRequestBody,
  RegisterRequestBody,
  ResendOtpRequestBody,
  UpdateApprovalStatusRequestBody,
  VerifyEmailRequestBody,
} from "../utils/types/authTypes";
import { ApplicationError } from "../utils/errors/applicationError";

const setAuthenticationCookie = (res: Response, token: string): void => {
  res.cookie(APPLICATION_CONSTANTS.TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: APPLICATION_CONSTANTS.COOKIE_MAX_AGE_MS,
  });
};

const clearAuthenticationCookie = (res: Response): void => {
  res.clearCookie(APPLICATION_CONSTANTS.TOKEN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
};

export const register = async (
  req: Request<unknown, unknown, RegisterRequestBody>,
  res: Response
): Promise<void> => {
   await registerUser(req.body);

  res.status(201).json({
    success: true,
    message: APPLICATION_MESSAGES.AUTH.REGISTER_SUCCESS,
  });
};

export const login = async (
  req: Request<unknown, unknown, LoginRequestBody>,
  res: Response
): Promise<void> => {
  const user = await loginUser(req.body);
  const token = generateAuthenticationToken(user!._id.toString());
  

  setAuthenticationCookie(res, token);

  res.status(200).json({
    success: true,
    message: APPLICATION_MESSAGES.AUTH.LOGIN_SUCCESS,
  });
};

export const verifyEmail = async (
  req: Request<unknown, unknown, VerifyEmailRequestBody>,
  res: Response
): Promise<void> => {
  const user = await verifyEmailOtp(req.body);

  res.status(200).json({
    success: true,
    message: APPLICATION_MESSAGES.AUTH.VERIFY_EMAIL_SUCCESS,
    data: user,
  });
};

export const resendOtp = async (
  req: Request<unknown, unknown, ResendOtpRequestBody>,
  res: Response
): Promise<void> => {
  const { otpCode } = await resendEmailOtp(req.body);

  res.status(200).json({
    success: true,
    message: APPLICATION_MESSAGES.AUTH.OTP_RESENT,
    ...(process.env.NODE_ENV !== "production" ? { otpCode } : {}),
  });
};

export const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = await getCurrentUser(req.authenticatedUserId as string);

  res.status(200).json({
    success: true,
    message: APPLICATION_MESSAGES.AUTH.CURRENT_USER_SUCCESS,
    data: user,
  });
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  clearAuthenticationCookie(res);

  res.status(200).json({
    success: true,
    message: APPLICATION_MESSAGES.AUTH.LOGOUT_SUCCESS,
  });
};

export const pendingApprovals = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const users = await getPendingApprovalUsers();

  res.status(200).json({
    success: true,
    message: APPLICATION_MESSAGES.AUTH.PENDING_APPROVAL_USERS_FETCHED,
    data: users,
  });
};

export const updateApprovalStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params as { userId: string };
  const requestBody = req.body as UpdateApprovalStatusRequestBody;

  if (typeof requestBody?.isApproved !== "boolean") {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, 400);
  }

  const updatedUser = await updateApprovalStatusForUser(userId, requestBody.isApproved);

  res.status(200).json({
    success: true,
    message: APPLICATION_MESSAGES.AUTH.APPROVAL_STATUS_UPDATED,
    data: updatedUser,
  });
};

export const completeProfile = async (
  req: AuthenticatedRequest & Request<unknown, unknown, CompleteProfileRequestBody>,
  res: Response
): Promise<void> => {
  const updatedUser = await completeUserProfile(req.authenticatedUserId as string, req.body);

  res.status(200).json({
    success: true,
    message: APPLICATION_MESSAGES.AUTH.PROFILE_COMPLETED,
    data: updatedUser,
  });
};
