import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { cloudinary } from "../../configuration/cloudinaryConfiguration";
import { CandidateProfileModel } from "../../models/candidateProfileModel";
import { HrProfileModel } from "../../models/hrProfileModel";
import { InterviewerProfileModel } from "../../models/interviewerProfileModel";
import { UserModel } from "../../models/userModel";
import {
  ApplicationError,
  APPLICATION_CONSTANTS,
  APPLICATION_MESSAGES,
  isCloudinaryEnvironmentConfigured,
  trimValue,
} from "../index";
import type {
  CompleteProfileRequestBody,
  LoginRequestBody,
  RegisterRequestBody,
  ResendOtpRequestBody,
  VerifyEmailRequestBody,
} from "../types";

export const shouldRepairResumeUrl = (resumeUrl: string, resumePublicId: string): boolean => {
  if (!resumePublicId) {
    return false;
  }

  if (!resumeUrl) {
    return true;
  }

  return resumeUrl.includes(APPLICATION_CONSTANTS.CLOUDINARY.RAW_UPLOAD_PATH);
};

export const resolveCloudinaryResumeSecureUrl = async (resumePublicId: string): Promise<string | null> => {
  if (!resumePublicId || !isCloudinaryEnvironmentConfigured()) {
    return null;
  }

  const resourceTypes: Array<"raw" | "image"> = [...APPLICATION_CONSTANTS.CLOUDINARY.RESOURCE_TYPES];

  for (const resourceType of resourceTypes) {
    try {
      const resource = await cloudinary.api.resource(resumePublicId, { resource_type: resourceType });
      if (resource?.secure_url) {
        return resource.secure_url;
      }
    } catch (error) {
      const isNotFound =
        typeof error === "object" &&
        error !== null &&
        "http_code" in error &&
        (error as { http_code?: number }).http_code === APPLICATION_CONSTANTS.CLOUDINARY.ERROR_CODES.NOT_FOUND;

      if (!isNotFound) {
        break;
      }
    }
  }

  return null;
};

export const validateRegisterInput = (payload: RegisterRequestBody): void => {
  const { name, email, password, role } = payload;

  if (!trimValue(name) || !trimValue(email) || !trimValue(password) || !role) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  if (password.length < APPLICATION_CONSTANTS.PASSWORD_MIN_LENGTH) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.PASSWORD_TOO_SHORT, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }
};

export const validateLoginInput = (payload: LoginRequestBody): void => {
  const { email, password } = payload;

  if (!trimValue(email) || !trimValue(password)) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }
};

export const validateVerifyEmailInput = (payload: VerifyEmailRequestBody): void => {
  const { email, otp } = payload;

  if (!trimValue(email) || !trimValue(otp)) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }
};

export const validateResendOtpInput = (payload: ResendOtpRequestBody): void => {
  if (!trimValue(payload.email)) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }
};

export const createOrRefreshOtpForUser = async (userId: Types.ObjectId): Promise<string> => {
  const otpCode = `${Math.floor(100000 + Math.random() * 900000)}`;
  const otpCodeHash = await bcrypt.hash(otpCode, 10);
  const otpExpiryTime = new Date(
    Date.now() + APPLICATION_CONSTANTS.OTP_EXPIRES_IN_MINUTES * 60 * 1000
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

export const createRoleProfile = async (role: string, userId: Types.ObjectId): Promise<void> => {
  if (role === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    await CandidateProfileModel.create({ userId });
    return;
  }

  if (role === APPLICATION_CONSTANTS.USER_ROLES.HR) {
    await HrProfileModel.create({ userId });
    return;
  }

  if (role === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) {
    await InterviewerProfileModel.create({ userId });
  }
};

export const validateCandidateProfileInput = (payload: CompleteProfileRequestBody): void => {
  if (
    !payload.phone?.trim() ||
    !payload.resumeUrl?.trim() ||
    !payload.skills?.trim() ||
    payload.experienceYears === undefined ||
    payload.experienceYears < 0 ||
    !payload.currentLocation?.trim()
  ) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }
};

export const validateHrProfileInput = (payload: CompleteProfileRequestBody): void => {
  if (!payload.position?.trim() || !payload.experienceLevel?.trim() || !payload.department?.trim()) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }
};

export const validateInterviewerProfileInput = (payload: CompleteProfileRequestBody): void => {
  if (!payload.position?.trim() || !payload.techStack?.trim() || !payload.experienceLevel?.trim()) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }
};
