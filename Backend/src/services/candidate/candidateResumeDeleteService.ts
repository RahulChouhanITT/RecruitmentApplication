import { CandidateProfileModel } from '../../models/candidateProfileModel';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import type { ResumeStorageIntegrationPayload, ServiceResult } from '../../utils/types';

const upsertCandidateProfileForDeletion = async (candidateUserId: string) => {
  return CandidateProfileModel.findOneAndUpdate(
    { userId: candidateUserId },
    { $setOnInsert: { userId: candidateUserId } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

export const deleteCandidateResume = async (
  candidateUserId: string,
): Promise<ServiceResult<null, null, ResumeStorageIntegrationPayload | null>> => {
  const profile = await upsertCandidateProfileForDeletion(candidateUserId);

  const existingResumePublicId = profile.resumePublicId;
  profile.resumeUrl = APPLICATION_CONSTANTS.EMPTY_STRING;
  profile.resumePublicId = APPLICATION_CONSTANTS.EMPTY_STRING;
  await profile.save();

  return {
    data: null,
    integrationPayload: existingResumePublicId
      ? {
          kind: 'deleteResume',
          existingResumePublicId,
        }
      : null,
  };
};
