import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import { ApplicationError, APPLICATION_CONSTANTS, APPLICATION_MESSAGES } from "../utils";
import { cloudinary } from "../configuration/cloudinaryConfiguration";
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
import { OtpVerificationModel } from "../models/otpVerificationModel";
import { UserModel } from "../models/userModel";
import { sendApprovalPendingEmail, sendApprovalSuccessEmail, sendOtpEmail } from "../utils/helpers/emailHelper";
import {
  assertEntityExists,
  isCloudinaryEnvironmentConfigured,
  normalizeEmailAddress,
  trimValue,
} from "../utils/helpers";

const shouldRepairResumeUrl = (resumeUrl: string, resumePublicId: string): boolean => {
  if (!resumePublicId) {
    return false;
  }

  if (!resumeUrl) {
    return true;
  }

  return resumeUrl.includes(APPLICATION_CONSTANTS.CLOUDINARY.RAW_UPLOAD_PATH);
};

const resolveCloudinaryResumeSecureUrl = async (resumePublicId: string): Promise<string | null> => {
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

const validateRegisterInput = (payload: RegisterRequestBody): void => {
  const { name, email, password, role } = payload;

  if (!trimValue(name) || !trimValue(email) || !trimValue(password) || !role) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  if (password.length < APPLICATION_CONSTANTS.PASSWORD_MIN_LENGTH) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.PASSWORD_TOO_SHORT, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }
};

const validateLoginInput = (payload: LoginRequestBody): void => {
  const { email, password } = payload;

  if (!trimValue(email) || !trimValue(password)) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }
};

const validateVerifyEmailInput = (payload: VerifyEmailRequestBody): void => {
  const { email, otp } = payload;

  if (!trimValue(email) || !trimValue(otp)) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }
};

const validateResendOtpInput = (payload: ResendOtpRequestBody): void => {
  if (!trimValue(payload.email)) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
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

  const safeUser = await UserModel.findById(createdUser._id).select("-passwordHash");
  assertEntityExists(safeUser, APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);

  return { user: safeUser, otpCode };
};

export const loginUser = async (payload: LoginRequestBody) => {
  validateLoginInput(payload);

  const user = await UserModel.findOne({ email: normalizeEmailAddress(payload.email) }).select(
    "+passwordHash"
  );

  if (!user) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.INVALID_CREDENTIALS, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.UNAUTHORIZED);
  }

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

  const safeUser = await UserModel.findById(user._id).select("-passwordHash");
  assertEntityExists(safeUser, APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR, 500);

  return safeUser;
};

export const verifyEmailOtp = async (payload: VerifyEmailRequestBody) => {
  validateVerifyEmailInput(payload);

  const email = normalizeEmailAddress(payload.email);
  const otp = trimValue(payload.otp);

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.OTP_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);
  }

  const otpRecord = await OtpVerificationModel.findOne({ userId: user._id, isUsed: false })
    .sort({ createdAt: -1 })
    .select("+otpCodeHash");

  if (!otpRecord) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.OTP_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);
  }

  if (otpRecord.attemptCount >= APPLICATION_CONSTANTS.OTP_MAX_ATTEMPTS) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.OTP_ATTEMPTS_EXCEEDED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.TOO_MANY_REQUESTS);
  }

  if (otpRecord.expiryTime.getTime() < Date.now()) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.OTP_EXPIRED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  const isOtpMatching = await bcrypt.compare(otp, otpRecord.otpCodeHash);
  if (!isOtpMatching) {
    otpRecord.attemptCount += 1;
    await otpRecord.save();
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.OTP_INVALID, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  otpRecord.isUsed = true;
  await otpRecord.save();

  user.isEmailVerified = true;
  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    user.isApproved = true;
  }
  await user.save();

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.HR || user.role === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) {
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

  const email = normalizeEmailAddress(payload.email);
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.OTP_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);
  }

  if (user.isEmailVerified) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.VERIFY_EMAIL_SUCCESS, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
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
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.UNAUTHORIZED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.UNAUTHORIZED);
  }

  return user;
};

const normalizeString = (value?: string | object): string | undefined => {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "object" && value !== null) {
    return String(value).trim();
  }
  return undefined;
};

export const getUserProfile = async (userId: string) => {
  const user = await UserModel.findById(userId).select("-passwordHash");
  if (!user) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);
  }

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
  if (!user) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);
  }

  const nextName = normalizeString(payload.name);
  if (nextName) {
    user.name = nextName;
  }
  await user.save();

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    await CandidateProfileModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          phone: normalizeString(payload.phone) ?? APPLICATION_CONSTANTS.EMPTY_STRING,
          resumeUrl: normalizeString(payload.resumeUrl) ?? APPLICATION_CONSTANTS.EMPTY_STRING,
          skills: normalizeString(payload.skills) ?? APPLICATION_CONSTANTS.EMPTY_STRING,
          experienceYears:
            typeof payload.experienceYears === "number" && payload.experienceYears >= 0
              ? payload.experienceYears
              : 0,
          currentLocation: normalizeString(payload.currentLocation) ?? APPLICATION_CONSTANTS.EMPTY_STRING,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.HR) {
    await HrProfileModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          department: normalizeString(payload.department) ?? APPLICATION_CONSTANTS.EMPTY_STRING,
          position: normalizeString(payload.position) ?? APPLICATION_CONSTANTS.EMPTY_STRING,
          experienceLevel: normalizeString(payload.experienceLevel) ?? APPLICATION_CONSTANTS.EMPTY_STRING,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) {
    await InterviewerProfileModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          position: normalizeString(payload.position) ?? APPLICATION_CONSTANTS.EMPTY_STRING,
          techStack: normalizeString(payload.techStack) ?? APPLICATION_CONSTANTS.EMPTY_STRING,
          experienceLevel: normalizeString(payload.experienceLevel) ?? APPLICATION_CONSTANTS.EMPTY_STRING,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  const updatedUser = await UserModel.findById(user._id).select("-passwordHash");
  if (!updatedUser) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  return updatedUser;
};

export const getPendingApprovalUsers = async () => {
  return UserModel.find({
    isEmailVerified: true,
    isApproved: false,
    role: { $in: [APPLICATION_CONSTANTS.USER_ROLES.HR, APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER] },
  })
    .select("-passwordHash")
    .sort({ createdAt: -1 });
};

export const updateApprovalStatusForUser = async (userId: string, isApproved: boolean) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);
  }

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

  const safeUser = await UserModel.findById(user._id).select("-passwordHash");
  if (!safeUser) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  return safeUser;
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

const validateCandidateProfileInput = (payload: CompleteProfileRequestBody): void => {
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

const validateHrProfileInput = (payload: CompleteProfileRequestBody): void => {
  if (!payload.position?.trim() || !payload.experienceLevel?.trim() || !payload.department?.trim()) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }
};

const validateInterviewerProfileInput = (payload: CompleteProfileRequestBody): void => {
  if (!payload.position?.trim() || !payload.techStack?.trim() || !payload.experienceLevel?.trim()) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }
};

export const completeUserProfile = async (userId: string, payload: CompleteProfileRequestBody) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApplicationError(APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);
  }

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

  const safeUser = await UserModel.findById(user._id).select("-passwordHash");
  if (!safeUser) {
    throw new ApplicationError(APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  return safeUser;
};
