import { CandidateProfileModel } from '../../models/candidateProfileModel';
import { HrProfileModel } from '../../models/hrProfileModel';
import { InterviewerProfileModel } from '../../models/interviewerProfileModel';
import { UserModel } from '../../models/userModel';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { assertEntityExists } from '../../utils/common/entityHelpers';
import { normalizeOptionalString } from '../../utils/common/stringHelpers';
import {
  validateCandidateProfileInput,
  validateHrProfileInput,
  validateInterviewerProfileInput,
} from '../../utils/auth';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import type { CompleteProfileRequestBody, GetOrUpdateProfileRequestBody } from '../../utils/types';

const findUserByIdForProfileMutation = async (userId: string) => {
  return UserModel.findById(userId);
};

export const repairCandidateResumeUrl = async (
  userId: string,
  resumeUrl: string,
): Promise<void> => {
  await CandidateProfileModel.findOneAndUpdate({ userId }, { $set: { resumeUrl } });
};

export const updateUserProfile = async (
  userId: string,
  profileUpdateInput: GetOrUpdateProfileRequestBody,
) => {
  const user = await findUserByIdForProfileMutation(userId);
  assertEntityExists(
    user,
    APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND,
    APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
  );

  const nextName = normalizeOptionalString(profileUpdateInput.name);
  if (nextName) {
    user.name = nextName;
  }
  await user.save();

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    const candidateUpdates: Record<string, string | number> = {};
    const phone = normalizeOptionalString(profileUpdateInput.phone);
    const resumeUrl = normalizeOptionalString(profileUpdateInput.resumeUrl);
    const skills = normalizeOptionalString(profileUpdateInput.skills);
    const currentLocation = normalizeOptionalString(profileUpdateInput.currentLocation);

    if (phone !== undefined) {
      candidateUpdates.phone = phone;
    }
    if (resumeUrl !== undefined) {
      candidateUpdates.resumeUrl = resumeUrl;
    }
    if (skills !== undefined) {
      candidateUpdates.skills = skills;
    }
    if (
      typeof profileUpdateInput.experienceYears === 'number' &&
      profileUpdateInput.experienceYears >= 0
    ) {
      candidateUpdates.experienceYears = profileUpdateInput.experienceYears;
    }
    if (currentLocation !== undefined) {
      candidateUpdates.currentLocation = currentLocation;
    }

    await CandidateProfileModel.findOneAndUpdate(
      { userId: user._id },
      { $set: candidateUpdates },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.HR) {
    const hrUpdates: Record<string, string> = {};
    const department = normalizeOptionalString(profileUpdateInput.department);
    const position = normalizeOptionalString(profileUpdateInput.position);
    const experienceLevel = normalizeOptionalString(profileUpdateInput.experienceLevel);

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
      { $set: hrUpdates },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) {
    const interviewerUpdates: Record<string, string> = {};
    const position = normalizeOptionalString(profileUpdateInput.position);
    const techStack = normalizeOptionalString(profileUpdateInput.techStack);
    const experienceLevel = normalizeOptionalString(profileUpdateInput.experienceLevel);

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
      { $set: interviewerUpdates },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }
};

export const completeUserProfile = async (
  userId: string,
  completeProfileInput: CompleteProfileRequestBody,
) => {
  const user = await findUserByIdForProfileMutation(userId);
  assertEntityExists(
    user,
    APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND,
    APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
  );

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    validateCandidateProfileInput(completeProfileInput);
    await CandidateProfileModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          phone: completeProfileInput.phone?.trim(),
          resumeUrl: completeProfileInput.resumeUrl?.trim(),
          skills: completeProfileInput.skills?.trim(),
          experienceYears: completeProfileInput.experienceYears,
          currentLocation: completeProfileInput.currentLocation?.trim(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.HR) {
    validateHrProfileInput(completeProfileInput);
    await HrProfileModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          position: completeProfileInput.position?.trim(),
          experienceLevel: completeProfileInput.experienceLevel?.trim(),
          department: completeProfileInput.department?.trim(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) {
    validateInterviewerProfileInput(completeProfileInput);
    await InterviewerProfileModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          position: completeProfileInput.position?.trim(),
          techStack: completeProfileInput.techStack?.trim(),
          experienceLevel: completeProfileInput.experienceLevel?.trim(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }

  user.profileCompleted = true;
  await user.save();
};
