import { APPLICATION_CONSTANTS } from '../constants/applicationConstants';
import { ApplicationError } from '../errors/applicationError';
import { APPLICATION_MESSAGES } from '../messages/applicationMessages';
import { CandidateProfileModel } from '../../models/candidateProfileModel';
import { HrProfileModel } from '../../models/hrProfileModel';
import { InterviewerProfileModel } from '../../models/interviewerProfileModel';
import { trimValue } from '../common/stringHelpers';
import type {
  AuthProvider,
  CompleteProfileRequestBody,
  LoginRequestBody,
  RegisterRequestBody,
  ResendOtpRequestBody,
  UserRole,
  VerifyEmailRequestBody,
} from '../types';

export const shouldRepairResumeUrl = (resumeUrl: string, resumePublicId: string): boolean => {
  if (!resumePublicId) {
    return false;
  }

  if (!resumeUrl) {
    return true;
  }

  return resumeUrl.includes(APPLICATION_CONSTANTS.CLOUDINARY.RAW_UPLOAD_PATH);
};

export const validateRegisterInput = (payload: RegisterRequestBody): void => {
  const { name, email, password, role } = payload;

  if (!trimValue(name) || !trimValue(email) || !trimValue(password) || !role) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  if (password.length < APPLICATION_CONSTANTS.PASSWORD_MIN_LENGTH) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.AUTH.PASSWORD_TOO_SHORT,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }
};

export const validateLoginInput = (payload: LoginRequestBody): void => {
  const { email, password } = payload;

  if (!trimValue(email) || !trimValue(password)) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }
};

export const validateVerifyEmailInput = (payload: VerifyEmailRequestBody): void => {
  const { email, otp } = payload;

  if (!trimValue(email) || !trimValue(otp)) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }
};

export const validateResendOtpInput = (payload: ResendOtpRequestBody): void => {
  if (!trimValue(payload.email)) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }
};

export const buildOtpVerificationNotificationPayload = (
  emailAddress: string,
  otpCode: string,
  userName: string,
) => ({
  kind: 'otpVerification' as const,
  emailAddress,
  otpCode,
  userName,
});

export const buildApprovalPendingNotificationPayload = (
  userRole: string,
  emailAddress: string,
  userName: string,
) => {
  if (
    userRole !== APPLICATION_CONSTANTS.USER_ROLES.HR &&
    userRole !== APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER
  ) {
    return null;
  }

  return {
    kind: 'approvalPending' as const,
    emailAddress,
    userName,
  };
};

export const createRoleProfileRecord = async (role: UserRole, userId: string): Promise<void> => {
  if (role === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    await CandidateProfileModel.create({ userId });
    return;
  }

  if (role === APPLICATION_CONSTANTS.USER_ROLES.HR) {
    await HrProfileModel.create({ userId });
    return;
  }

  await InterviewerProfileModel.create({ userId });
};

export const mergeAuthProvider = (
  currentProvider: AuthProvider | undefined,
  nextProvider: AuthProvider,
): AuthProvider => {
  if (!currentProvider || currentProvider === nextProvider) {
    return nextProvider;
  }

  return 'hybrid';
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
    throw new ApplicationError(
      APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }
};

export const validateHrProfileInput = (payload: CompleteProfileRequestBody): void => {
  if (
    !payload.position?.trim() ||
    !payload.experienceLevel?.trim() ||
    !payload.department?.trim()
  ) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }
};

export const validateInterviewerProfileInput = (payload: CompleteProfileRequestBody): void => {
  if (!payload.position?.trim() || !payload.techStack?.trim() || !payload.experienceLevel?.trim()) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }
};
