import { CandidateProfileModel } from '../../models/candidateProfileModel';
import { HrProfileModel } from '../../models/hrProfileModel';
import { InterviewerProfileModel } from '../../models/interviewerProfileModel';
import { UserModel } from '../../models/userModel';
import { USER_SAFE_FIELDS } from '../../utils/constants';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { assertEntityExists } from '../../utils/common/entityHelpers';
import { shouldRepairResumeUrl } from '../../utils/auth';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import type { ResumeUrlRepairIntegrationPayload, ServiceResult } from '../../utils/types';

const fetchSafeUserById = async (userId: string) => {
  return UserModel.findById(userId).select(USER_SAFE_FIELDS);
};

const findCandidateProfileByUserId = async (userId: string) => {
  return CandidateProfileModel.findOne({ userId });
};

const findHrProfileByUserId = async (userId: string) => {
  return HrProfileModel.findOne({ userId });
};

const findInterviewerProfileByUserId = async (userId: string) => {
  return InterviewerProfileModel.findOne({ userId });
};

export const getCurrentUser = async (userId: string) => {
  const user = await fetchSafeUserById(userId);
  assertEntityExists(
    user,
    APPLICATION_MESSAGES.ERROR.UNAUTHORIZED,
    APPLICATION_CONSTANTS.HTTP_STATUS_CODES.UNAUTHORIZED,
  );

  return user;
};

export const getUserProfile = async (
  userId: string,
): Promise<
  ServiceResult<
    Record<string, string | number | boolean>,
    null,
    ResumeUrlRepairIntegrationPayload | null
  >
> => {
  const user = await fetchSafeUserById(userId);
  assertEntityExists(
    user,
    APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND,
    APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
  );

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    const profile = await findCandidateProfileByUserId(user._id.toString());
    const resumeUrl = profile?.resumeUrl ?? APPLICATION_CONSTANTS.EMPTY_STRING;

    return {
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
        phone: profile?.phone ?? APPLICATION_CONSTANTS.EMPTY_STRING,
        currentLocation: profile?.currentLocation ?? APPLICATION_CONSTANTS.EMPTY_STRING,
        skills: profile?.skills ?? APPLICATION_CONSTANTS.EMPTY_STRING,
        experienceYears: profile?.experienceYears ?? 0,
        resumeUrl,
      },
      integrationPayload:
        profile && shouldRepairResumeUrl(resumeUrl, profile.resumePublicId)
          ? {
              kind: 'resolveResumeUrl',
              resumePublicId: profile.resumePublicId,
              currentResumeUrl: resumeUrl,
            }
          : null,
    };
  }

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.HR) {
    const profile = await findHrProfileByUserId(user._id.toString());

    return {
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
        department: profile?.department ?? APPLICATION_CONSTANTS.EMPTY_STRING,
        position: profile?.position ?? APPLICATION_CONSTANTS.EMPTY_STRING,
        experienceLevel: profile?.experienceLevel ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      },
    };
  }

  const profile = await findInterviewerProfileByUserId(user._id.toString());

  return {
    data: {
      name: user.name,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted,
      position: profile?.position ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      techStack: profile?.techStack ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      experienceLevel: profile?.experienceLevel ?? APPLICATION_CONSTANTS.EMPTY_STRING,
    },
  };
};
