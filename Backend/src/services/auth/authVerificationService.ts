import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { UserModel } from '../../models/userModel';
import { AUTH_OTP_FIELDS, AUTH_SAFE_USER_FIELDS } from '../../utils/constants';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { assertEntityExists } from '../../utils/common/entityHelpers';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import { normalizeEmailAddress, trimValue } from '../../utils/common/stringHelpers';
import {
  buildApprovalPendingNotificationPayload,
  buildOtpVerificationNotificationPayload,
  validateResendOtpInput,
  validateVerifyEmailInput,
} from '../../utils/auth';
import type { ResendOtpRequestBody, VerifyEmailRequestBody } from '../../utils/types';
import type { NotificationPayload, ServiceResult } from '../../utils/types';

const fetchSafeUserById = async (userId: Types.ObjectId) => {
  const safeUser = await UserModel.findById(userId).select(AUTH_SAFE_USER_FIELDS).lean();
  assertEntityExists(
    safeUser,
    APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
    APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
  );
  return safeUser;
};

const findUserForOtpByEmail = async (email: string) => {
  return UserModel.findOne({ email }).select(AUTH_OTP_FIELDS);
};

const refreshOtpForUser = async (userId: Types.ObjectId): Promise<string> => {
  const otpCode = `${Math.floor(100000 + Math.random() * 900000)}`;
  const otpCodeHash = await bcrypt.hash(otpCode, 10);
  const otpExpiryTime = new Date(
    Date.now() + APPLICATION_CONSTANTS.OTP_EXPIRES_IN_MINUTES * 60 * 1000,
  );

  await UserModel.findByIdAndUpdate(userId, {
    $set: {
      otpCodeHash,
      otpExpiryTime,
      otpAttemptCount: 0,
    },
  });

  return otpCode;
};

export const verifyEmailOtp = async (
  verificationInput: VerifyEmailRequestBody,
): Promise<
  ServiceResult<Awaited<ReturnType<typeof fetchSafeUserById>>, NotificationPayload | null>
> => {
  validateVerifyEmailInput(verificationInput);

  const email = normalizeEmailAddress(verificationInput.email);
  const otp = trimValue(verificationInput.otp);

  const user = await findUserForOtpByEmail(email);
  assertEntityExists(
    user,
    APPLICATION_MESSAGES.AUTH.OTP_NOT_FOUND,
    APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
  );
  assertEntityExists(
    user.otpCodeHash,
    APPLICATION_MESSAGES.AUTH.OTP_NOT_FOUND,
    APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
  );
  assertEntityExists(
    user.otpExpiryTime,
    APPLICATION_MESSAGES.AUTH.OTP_NOT_FOUND,
    APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
  );

  if ((user.otpAttemptCount ?? 0) >= APPLICATION_CONSTANTS.OTP_MAX_ATTEMPTS) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.AUTH.OTP_ATTEMPTS_EXCEEDED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
    );
  }

  if (user.otpExpiryTime.getTime() < Date.now()) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.AUTH.OTP_EXPIRED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  const isOtpMatching = await bcrypt.compare(otp, user.otpCodeHash);
  if (!isOtpMatching) {
    user.otpAttemptCount = (user.otpAttemptCount ?? 0) + 1;
    await user.save();
    throw new ApplicationError(
      APPLICATION_MESSAGES.AUTH.OTP_INVALID,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  user.isEmailVerified = true;
  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    user.isApproved = true;
  }
  user.otpCodeHash = undefined;
  user.otpExpiryTime = null;
  user.otpAttemptCount = 0;
  await user.save();

  const safeUser = await fetchSafeUserById(user._id as Types.ObjectId);
  const notificationPayload = buildApprovalPendingNotificationPayload(
    user.role,
    user.email,
    user.name,
  );

  return {
    data: safeUser,
    notificationPayload,
  };
};

export const resendEmailOtp = async (
  resendOtpInput: ResendOtpRequestBody,
): Promise<ServiceResult<{ otpCode: string }, NotificationPayload>> => {
  validateResendOtpInput(resendOtpInput);

  const email = normalizeEmailAddress(resendOtpInput.email);
  const user = await findUserForOtpByEmail(email);
  assertEntityExists(
    user,
    APPLICATION_MESSAGES.AUTH.OTP_NOT_FOUND,
    APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
  );

  if (user.isEmailVerified) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.AUTH.VERIFY_EMAIL_SUCCESS,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  const otpCode = await refreshOtpForUser(user._id as Types.ObjectId);

  return {
    data: { otpCode },
    notificationPayload: buildOtpVerificationNotificationPayload(user.email, otpCode, user.name),
  };
};
