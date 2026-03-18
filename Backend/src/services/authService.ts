import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { ApplicationError, APPLICATION_CONSTANTS, APPLICATION_MESSAGES } from "../utils";
import type {
  CompleteProfileRequestBody,
  GetOrUpdateProfileRequestBody,
  LoginRequestBody,
  RegisterRequestBody,
  ResendOtpRequestBody,
  VerifyEmailRequestBody,
} from "../utils/types";
import { CandidateProfileModel } from "../models/candidateProfileModel";
import { HrProfileModel } from "../models/hrProfileModel";
import { InterviewerProfileModel } from "../models/interviewerProfileModel";
import { UserModel } from "../models/userModel";
import {
  createOrRefreshOtpForUser,
  createRoleProfile,
  resolveCloudinaryResumeSecureUrl,
  sendApprovalPendingEmail,
  sendApprovalSuccessEmail,
  sendOtpEmail,
  shouldRepairResumeUrl,
  validateCandidateProfileInput,
  validateHrProfileInput,
  validateInterviewerProfileInput,
  validateLoginInput,
  validateRegisterInput,
  validateResendOtpInput,
  validateVerifyEmailInput,
} from "../utils/auth";
import {
  assertEntityExists,
  normalizeEmailAddress,
  normalizeOptionalString,
  trimValue,
} from "../utils";

export const registerUser = async (payload: RegisterRequestBody) => {
  validateRegisterInput(payload);

  const existingUser = await UserModel.findOne({ email: normalizeEmailAddress(payload.email) });

  if (existingUser) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CONFLICT);
  }

  const createdUser = await UserModel.create({
    name: trimValue(payload.name),
    email: normalizeEmailAddress(payload.email),
    passwordHash: payload.password,
    role: payload.role,
  });

  await createRoleProfile(payload.role, createdUser._id as Types.ObjectId);
  const otpCode = await createOrRefreshOtpForUser(createdUser._id as Types.ObjectId);
  await sendOtpEmail(createdUser.email, otpCode, createdUser.name);

  const safeUser = await UserModel.findById(createdUser._id).select("-passwordHash -otpCodeHash -otpExpiryTime -otpAttemptCount");
  assertEntityExists(safeUser, APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);

  return { user: safeUser, otpCode };
};

export const loginUser = async (payload: LoginRequestBody) => {
  validateLoginInput(payload);

  const user = await UserModel.findOne({ email: normalizeEmailAddress(payload.email) }).select("+passwordHash");
  assertEntityExists(user, APPLICATION_MESSAGES.AUTH.INVALID_CREDENTIALS, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.UNAUTHORIZED);

  const isPasswordMatching = await user.comparePassword(payload.password);

  if (!isPasswordMatching) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.INVALID_CREDENTIALS, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.UNAUTHORIZED);
  }

  if (!user.isEmailVerified) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.EMAIL_NOT_VERIFIED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN);
  }

  if (!user.isApproved) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.USER_NOT_APPROVED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN);
  }

  const safeUser = await UserModel.findById(user._id).select("-passwordHash -otpCodeHash -otpExpiryTime -otpAttemptCount");
  assertEntityExists(safeUser, APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);

  return safeUser;
};

export const verifyEmailOtp = async (payload: VerifyEmailRequestBody) => {
  validateVerifyEmailInput(payload);

  const email = normalizeEmailAddress(payload.email);
  const otp = trimValue(payload.otp);

  const user = await UserModel.findOne({ email }).select("+otpCodeHash +otpExpiryTime +otpAttemptCount");
  assertEntityExists(user, APPLICATION_MESSAGES.AUTH.OTP_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);
  assertEntityExists(user.otpCodeHash, APPLICATION_MESSAGES.AUTH.OTP_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);
  assertEntityExists(user.otpExpiryTime, APPLICATION_MESSAGES.AUTH.OTP_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);

  if ((user.otpAttemptCount ?? 0) >= APPLICATION_CONSTANTS.OTP_MAX_ATTEMPTS) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.OTP_ATTEMPTS_EXCEEDED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.TOO_MANY_REQUESTS);
  }

  if (user.otpExpiryTime.getTime() < Date.now()) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.OTP_EXPIRED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  const isOtpMatching = await bcrypt.compare(otp, user.otpCodeHash);
  if (!isOtpMatching) {
    user.otpAttemptCount = (user.otpAttemptCount ?? 0) + 1;
    await user.save();
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.OTP_INVALID, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  user.isEmailVerified = true;
  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    user.isApproved = true;
  }
  user.otpCodeHash = undefined;
  user.otpExpiryTime = null;
  user.otpAttemptCount = 0;
  await user.save();

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.HR || user.role === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) {
    try {
      await sendApprovalPendingEmail(user.email, user.name);
    } catch (_error) {
    }
  }

  const safeUser = await UserModel.findById(user._id).select("-passwordHash -otpCodeHash -otpExpiryTime -otpAttemptCount");
  assertEntityExists(safeUser, APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);

  return safeUser;
};

export const resendEmailOtp = async (payload: ResendOtpRequestBody) => {
  validateResendOtpInput(payload);

  const email = normalizeEmailAddress(payload.email);
  const user = await UserModel.findOne({ email }).select("+otpCodeHash +otpExpiryTime +otpAttemptCount");
  assertEntityExists(user, APPLICATION_MESSAGES.AUTH.OTP_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);

  if (user.isEmailVerified) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.VERIFY_EMAIL_SUCCESS, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  const otpCode = await createOrRefreshOtpForUser(user._id as Types.ObjectId);
  await sendOtpEmail(user.email, otpCode, user.name);

  return { otpCode };
};

export const getCurrentUser = async (userId: string) => {
  const user = await UserModel.findById(userId).select("-passwordHash -otpCodeHash -otpExpiryTime -otpAttemptCount");
  assertEntityExists(user, APPLICATION_MESSAGES.ERROR.UNAUTHORIZED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.UNAUTHORIZED);
  return user;
};

export const getUserProfile = async (userId: string) => {
  const user = await UserModel.findById(userId).select("-passwordHash -otpCodeHash -otpExpiryTime -otpAttemptCount");
  assertEntityExists(user, APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    const profile = await CandidateProfileModel.findOne({ userId: user._id });
    let resumeUrl = profile?.resumeUrl ?? APPLICATION_CONSTANTS.EMPTY_STRING;

    if (profile && shouldRepairResumeUrl(resumeUrl, profile.resumePublicId)) {
      const resolvedResumeUrl = await resolveCloudinaryResumeSecureUrl(profile.resumePublicId);
      if (resolvedResumeUrl) {
        resumeUrl = resolvedResumeUrl;

        if (resolvedResumeUrl !== profile.resumeUrl) {
          profile.resumeUrl = resolvedResumeUrl;
          await profile.save();
        }
      }
    }

    return {
      name: user.name,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted,
      phone: profile?.phone ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      currentLocation: profile?.currentLocation ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      skills: profile?.skills ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      experienceYears: profile?.experienceYears ?? 0,
      resumeUrl,
    };
  }

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.HR) {
    const profile = await HrProfileModel.findOne({ userId: user._id });
    return {
      name: user.name,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted,
      department: profile?.department ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      position: profile?.position ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      experienceLevel: profile?.experienceLevel ?? APPLICATION_CONSTANTS.EMPTY_STRING,
    };
  }

  const profile = await InterviewerProfileModel.findOne({ userId: user._id });
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    profileCompleted: user.profileCompleted,
    position: profile?.position ?? APPLICATION_CONSTANTS.EMPTY_STRING,
    techStack: profile?.techStack ?? APPLICATION_CONSTANTS.EMPTY_STRING,
    experienceLevel: profile?.experienceLevel ?? APPLICATION_CONSTANTS.EMPTY_STRING,
  };
};

export const updateUserProfile = async (userId: string, payload: GetOrUpdateProfileRequestBody) => {
  const user = await UserModel.findById(userId);
  assertEntityExists(user, APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);

  const nextName = normalizeOptionalString(payload.name);
  if (nextName) {
    user.name = nextName;
  }
  await user.save();

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    const candidateUpdates: Record<string, string | number> = {};
    const phone = normalizeOptionalString(payload.phone);
    const resumeUrl = normalizeOptionalString(payload.resumeUrl);
    const skills = normalizeOptionalString(payload.skills);
    const currentLocation = normalizeOptionalString(payload.currentLocation);

    if (phone !== undefined) {
      candidateUpdates.phone = phone;
    }

    if (resumeUrl !== undefined) {
      candidateUpdates.resumeUrl = resumeUrl;
    }

    if (skills !== undefined) {
      candidateUpdates.skills = skills;
    }

    if (typeof payload.experienceYears === "number" && payload.experienceYears >= 0) {
      candidateUpdates.experienceYears = payload.experienceYears;
    }

    if (currentLocation !== undefined) {
      candidateUpdates.currentLocation = currentLocation;
    }

    await CandidateProfileModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: candidateUpdates,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.HR) {
    const hrUpdates: Record<string, string> = {};
    const department = normalizeOptionalString(payload.department);
    const position = normalizeOptionalString(payload.position);
    const experienceLevel = normalizeOptionalString(payload.experienceLevel);

    if (department !== undefined) {
      hrUpdates.department = department;
    }

    if (position !== undefined) {
      hrUpdates.position = position;
    }

    if (experienceLevel !== undefined) {
      hrUpdates.experienceLevel = experienceLevel;
    }

    await HrProfileModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: hrUpdates,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) {
    const interviewerUpdates: Record<string, string> = {};
    const position = normalizeOptionalString(payload.position);
    const techStack = normalizeOptionalString(payload.techStack);
    const experienceLevel = normalizeOptionalString(payload.experienceLevel);

    if (position !== undefined) {
      interviewerUpdates.position = position;
    }

    if (techStack !== undefined) {
      interviewerUpdates.techStack = techStack;
    }

    if (experienceLevel !== undefined) {
      interviewerUpdates.experienceLevel = experienceLevel;
    }

    await InterviewerProfileModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: interviewerUpdates,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  

  return ;
};

export const getPendingApprovalUsers = async () => {
  return UserModel.find({
    isEmailVerified: true,
    isApproved: false,
    role: { $in: [APPLICATION_CONSTANTS.USER_ROLES.HR, APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER] },
  })
    .select("-passwordHash -otpCodeHash -otpExpiryTime -otpAttemptCount")
    .sort({ createdAt: -1 });
};

export const updateApprovalStatusForUser = async (userId: string, isApproved: boolean) => {
  const user = await UserModel.findById(userId);
  assertEntityExists(user, APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);

  if (!user.isEmailVerified) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.EMAIL_NOT_VERIFIED_FOR_APPROVAL, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  user.isApproved = isApproved;
  await user.save();

  if (isApproved) {
    try {
      await sendApprovalSuccessEmail(user.email, user.name);
    } catch (_error) {
    }
  }
  return ;
};

export const getApprovedInterviewers = async () => {
  return UserModel.find({
    role: APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER,
    isEmailVerified: true,
    isApproved: true,
  })
    .select("_id name email")
    .sort({ name: 1 });
};

export const completeUserProfile = async (userId: string, payload: CompleteProfileRequestBody) => {
  const user = await UserModel.findById(userId);
  assertEntityExists(user, APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    validateCandidateProfileInput(payload);
    await CandidateProfileModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          phone: payload.phone?.trim(),
          resumeUrl: payload.resumeUrl?.trim(),
          skills: payload.skills?.trim(),
          experienceYears: payload.experienceYears,
          currentLocation: payload.currentLocation?.trim(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.HR) {
    validateHrProfileInput(payload);
    await HrProfileModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          position: payload.position?.trim(),
          experienceLevel: payload.experienceLevel?.trim(),
          department: payload.department?.trim(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) {
    validateInterviewerProfileInput(payload);
    await InterviewerProfileModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          position: payload.position?.trim(),
          techStack: payload.techStack?.trim(),
          experienceLevel: payload.experienceLevel?.trim(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  user.profileCompleted = true;
  await user.save();

  return ;
};
