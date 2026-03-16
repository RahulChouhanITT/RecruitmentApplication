import type { Request, Response } from "express";
import { APPLICATION_CONSTANTS } from "../utils/constants/applicationConstants";
import { CONFIGURATION_CONSTANTS } from "../utils/constants/configurationConstants";
import { isBooleanValue, sendSuccessResponse } from "../utils/helpers";
import { APPLICATION_MESSAGES } from "../utils/messages/applicationMessages";
import { generateAuthenticationToken } from "../utils/helpers/tokenHelper";
import {
  completeUserProfile,
  getPendingApprovalUsers,
  getApprovedInterviewers,
  getCurrentUser,
  getUserProfile,
  loginUser,
  registerUser,
  resendEmailOtp,
  updateUserProfile,
  updateApprovalStatusForUser,
  verifyEmailOtp,
} from "../services/authService";
import type {
  AuthenticatedRequest,
  CompleteProfileRequestBody,
  GetOrUpdateProfileRequestBody,
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
    secure: process.env.NODE_ENV === CONFIGURATION_CONSTANTS.ENVIRONMENTS.PRODUCTION,
    maxAge: APPLICATION_CONSTANTS.COOKIE_MAX_AGE_MS,
  });
};

const clearAuthenticationCookie = (res: Response): void => {
  res.clearCookie(APPLICATION_CONSTANTS.TOKEN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === CONFIGURATION_CONSTANTS.ENVIRONMENTS.PRODUCTION,
  });
};

export const register = async (
  req: Request<unknown, unknown, RegisterRequestBody>,
  res: Response
): Promise<void> => {
   await registerUser(req.body);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CREATED,
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

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.LOGIN_SUCCESS,
  });
};

export const verifyEmail = async (
  req: Request<unknown, unknown, VerifyEmailRequestBody>,
  res: Response
): Promise<void> => {
  const user = await verifyEmailOtp(req.body);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.VERIFY_EMAIL_SUCCESS,
    data: user,
  });
};

export const resendOtp = async (
  req: Request<unknown, unknown, ResendOtpRequestBody>,
  res: Response
): Promise<void> => {
  const { otpCode } = await resendEmailOtp(req.body);

  res.status(APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK).json({
    success: true,
    message: APPLICATION_MESSAGES.AUTH.OTP_RESENT,
    ...(process.env.NODE_ENV !== CONFIGURATION_CONSTANTS.ENVIRONMENTS.PRODUCTION ? { otpCode } : {}),
  });
};

export const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = await getCurrentUser(req.authenticatedUserId as string);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.CURRENT_USER_SUCCESS,
    data: user,
  });
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  clearAuthenticationCookie(res);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.LOGOUT_SUCCESS,
  });
};

export const pendingApprovals = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const users = await getPendingApprovalUsers();

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
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

  if (!isBooleanValue(requestBody?.isApproved)) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  const updatedUser = await updateApprovalStatusForUser(userId, requestBody.isApproved);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.APPROVAL_STATUS_UPDATED,
    data: updatedUser,
  });
};

export const completeProfile = async (
  req: AuthenticatedRequest & Request<unknown, unknown, CompleteProfileRequestBody>,
  res: Response
): Promise<void> => {
  const updatedUser = await completeUserProfile(req.authenticatedUserId as string, req.body);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.PROFILE_COMPLETED,
    data: updatedUser,
  });
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const profile = await getUserProfile(req.authenticatedUserId as string);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.PROFILE_FETCHED,
    data: profile,
  });
};

export const updateProfile = async (
  req: AuthenticatedRequest & Request<unknown, unknown, GetOrUpdateProfileRequestBody>,
  res: Response
): Promise<void> => {
  const updatedUser = await updateUserProfile(req.authenticatedUserId as string, req.body);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.PROFILE_UPDATED,
    data: updatedUser,
  });
};

export const interviewers = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const interviewersList = await getApprovedInterviewers();

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.INTERVIEWERS_FETCHED,
    data: interviewersList,
  });
};
