import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import { ApplicationError } from "../utils/errors/applicationError";
import type {
  CompleteProfileRequestBody,
  LoginRequestBody,
  RegisterRequestBody,
  ResendOtpRequestBody,
  VerifyEmailRequestBody,
} from "../utils/types/authTypes";
import { APPLICATION_MESSAGES } from "../utils/messages/applicationMessages";
import { APPLICATION_CONSTANTS } from "../utils/constants/applicationConstants";
import { CandidateProfileModel } from "../models/candidateProfileModel";
import { HrProfileModel } from "../models/hrProfileModel";
import { InterviewerProfileModel } from "../models/interviewerProfileModel";
import { OtpVerificationModel } from "../models/otpVerificationModel";
import { UserModel } from "../models/userModel";
import { sendApprovalPendingEmail, sendOtpEmail } from "../utils/emailUtility";

const validateRegisterInput = (payload: RegisterRequestBody): void => {
  const { name, email, password, role } = payload;

  if (!name?.trim() || !email?.trim() || !password?.trim() || !role) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, 400);
  }

  if (password.length < 8) {
    throw new ApplicationError("Password must be at least 8 characters", 400);
  }
};

const validateLoginInput = (payload: LoginRequestBody): void => {
  const { email, password } = payload;

  if (!email?.trim() || !password?.trim()) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, 400);
  }
};

const validateVerifyEmailInput = (payload: VerifyEmailRequestBody): void => {
  const { email, otp } = payload;

  if (!email?.trim() || !otp?.trim()) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, 400);
  }
};

const validateResendOtpInput = (payload: ResendOtpRequestBody): void => {
  if (!payload.email?.trim()) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, 400);
  }
};

const generateOtpCode = (): string => {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
};

const createOrRefreshOtpForUser = async (userId: Types.ObjectId): Promise<string> => {
  const otpCode = generateOtpCode();
  const otpCodeHash = await bcrypt.hash(otpCode, 10);
  const expiryTime = new Date(
    Date.now() + APPLICATION_CONSTANTS.OTP_EXPIRES_IN_MINUTES * 60 * 1000
  );

  await OtpVerificationModel.findOneAndUpdate(
    { userId, isUsed: false },
    {
      $set: {
        otpCodeHash,
        expiryTime,
        isUsed: false,
        attemptCount: 0,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return otpCode;
};

const createRoleProfile = async (role: string, userId: Types.ObjectId): Promise<void> => {
  if (role === "candidate") {
    await CandidateProfileModel.create({ userId });
    return;
  }

  if (role === "hr") {
    await HrProfileModel.create({ userId });
    return;
  }

  if (role === "interviewer") {
    await InterviewerProfileModel.create({ userId });
  }
};

export const registerUser = async (payload: RegisterRequestBody) => {
  validateRegisterInput(payload);

  const existingUser = await UserModel.findOne({ email: payload.email.trim().toLowerCase() });

  if (existingUser) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS, 409);
  }

  const createdUser = await UserModel.create({
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    passwordHash: payload.password,
    role: payload.role,
  });

  await createRoleProfile(payload.role, createdUser._id as Types.ObjectId);
  const otpCode = await createOrRefreshOtpForUser(createdUser._id as Types.ObjectId);
  await sendOtpEmail(createdUser.email, otpCode, createdUser.name);

  const safeUser = await UserModel.findById(createdUser._id).select("-passwordHash");
  if (!safeUser) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR, 500);
  }

  return { user: safeUser, otpCode };
};

export const loginUser = async (payload: LoginRequestBody) => {
  validateLoginInput(payload);

  const user = await UserModel.findOne({ email: payload.email.trim().toLowerCase() }).select(
    "+passwordHash"
  );

  if (!user) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.INVALID_CREDENTIALS, 401);
  }

  const isPasswordMatching = await user.comparePassword(payload.password);

  if (!isPasswordMatching) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.INVALID_CREDENTIALS, 401);
  }

  if (!user.isEmailVerified) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.EMAIL_NOT_VERIFIED, 403);
  }

  if (!user.isApproved) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.USER_NOT_APPROVED, 403);
  }

  const safeUser = await UserModel.findById(user._id).select("-passwordHash");
  if (!safeUser) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR, 500);
  }

  return safeUser;
};

export const verifyEmailOtp = async (payload: VerifyEmailRequestBody) => {
  validateVerifyEmailInput(payload);

  const email = payload.email.trim().toLowerCase();
  const otp = payload.otp.trim();

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.OTP_NOT_FOUND, 404);
  }

  const otpRecord = await OtpVerificationModel.findOne({ userId: user._id, isUsed: false })
    .sort({ createdAt: -1 })
    .select("+otpCodeHash");

  if (!otpRecord) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.OTP_NOT_FOUND, 404);
  }

  if (otpRecord.attemptCount >= APPLICATION_CONSTANTS.OTP_MAX_ATTEMPTS) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.OTP_ATTEMPTS_EXCEEDED, 429);
  }

  if (otpRecord.expiryTime.getTime() < Date.now()) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.OTP_EXPIRED, 400);
  }

  const isOtpMatching = await bcrypt.compare(otp, otpRecord.otpCodeHash);
  if (!isOtpMatching) {
    otpRecord.attemptCount += 1;
    await otpRecord.save();
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.OTP_INVALID, 400);
  }

  otpRecord.isUsed = true;
  await otpRecord.save();

  user.isEmailVerified = true;
  if (user.role === "candidate") {
    user.isApproved = true;
  }
  await user.save();

  if (user.role === "hr" || user.role === "interviewer") {
    try {
      await sendApprovalPendingEmail(user.email, user.name);
    } catch (_error) {
    }
  }

  const safeUser = await UserModel.findById(user._id).select("-passwordHash");
  if (!safeUser) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR, 500);
  }

  return safeUser;
};

export const resendEmailOtp = async (payload: ResendOtpRequestBody) => {
  validateResendOtpInput(payload);

  const email = payload.email.trim().toLowerCase();
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.OTP_NOT_FOUND, 404);
  }

  if (user.isEmailVerified) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.VERIFY_EMAIL_SUCCESS, 400);
  }

  await OtpVerificationModel.updateMany(
    { userId: user._id, isUsed: false },
    {
      $set: {
        isUsed: true,
      },
    }
  );

  const otpCode = await createOrRefreshOtpForUser(user._id as Types.ObjectId);
  await sendOtpEmail(user.email, otpCode, user.name);

  return { otpCode };
};

export const getCurrentUser = async (userId: string) => {
  const user = await UserModel.findById(userId).select("-passwordHash");

  if (!user) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.UNAUTHORIZED, 401);
  }

  return user;
};

export const getPendingApprovalUsers = async () => {
  return UserModel.find({
    isEmailVerified: true,
    isApproved: false,
    role: { $in: ["hr", "interviewer"] },
  })
    .select("-passwordHash")
    .sort({ createdAt: -1 });
};

export const updateApprovalStatusForUser = async (userId: string, isApproved: boolean) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND, 404);
  }

  if (!user.isEmailVerified) {
    throw new ApplicationError("User email is not verified yet", 400);
  }

  user.isApproved = isApproved;
  await user.save();

  const safeUser = await UserModel.findById(user._id).select("-passwordHash");
  if (!safeUser) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR, 500);
  }

  return safeUser;
};

const validateCandidateProfileInput = (payload: CompleteProfileRequestBody): void => {
  if (
    !payload.phone?.trim() ||
    !payload.resumeUrl?.trim() ||
    !payload.skills?.trim() ||
    payload.experienceYears === undefined ||
    payload.experienceYears < 0 ||
    !payload.currentLocation?.trim()
  ) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, 400);
  }
};

const validateHrProfileInput = (payload: CompleteProfileRequestBody): void => {
  if (!payload.position?.trim() || !payload.experienceLevel?.trim() || !payload.department?.trim()) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, 400);
  }
};

const validateInterviewerProfileInput = (payload: CompleteProfileRequestBody): void => {
  if (!payload.position?.trim() || !payload.techStack?.trim() || !payload.experienceLevel?.trim()) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, 400);
  }
};

export const completeUserProfile = async (userId: string, payload: CompleteProfileRequestBody) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND, 404);
  }

  if (user.role === "candidate") {
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

  if (user.role === "hr") {
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

  if (user.role === "interviewer") {
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

  const safeUser = await UserModel.findById(user._id).select("-passwordHash");
  if (!safeUser) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR, 500);
  }

  return safeUser;
};
