import { CandidateProfileModel } from '../../models/candidateProfileModel';
import { validateResumeFile } from './helpers/candidateResumeHelpers';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import type { ResumeStorageIntegrationPayload, ServiceResult } from '../../utils/types';
import type { UploadedResumeFile } from '../../utils/types/candidateTypes';

type ResumeAsset = {
  secure_url: string;
  public_id: string;
};

const upsertCandidateProfileForResume = async (candidateUserId: string) => {
  return CandidateProfileModel.findOneAndUpdate(
    { userId: candidateUserId },
    { $setOnInsert: { userId: candidateUserId } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

const findCandidateProfileByUserId = async (candidateUserId: string) => {
  return CandidateProfileModel.findOne({ userId: candidateUserId });
};

const updateCandidateResumeAsset = async (candidateUserId: string, uploadedAsset: ResumeAsset) => {
  await CandidateProfileModel.findOneAndUpdate(
    { userId: candidateUserId },
    {
      $setOnInsert: { userId: candidateUserId },
      $set: {
        resumeUrl: uploadedAsset.secure_url,
        resumePublicId: uploadedAsset.public_id,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

export const uploadCandidateResume = async (
  candidateUserId: string,
  file?: UploadedResumeFile,
): Promise<
  ServiceResult<{ previousResumePublicId: string }, null, ResumeStorageIntegrationPayload>
> => {
  const validatedFile = validateResumeFile(file);
  const profile = await upsertCandidateProfileForResume(candidateUserId);

  return {
    data: {
      previousResumePublicId: profile.resumePublicId,
    },
    integrationPayload: {
      kind: 'uploadResume',
      existingResumePublicId: profile.resumePublicId,
      file: validatedFile,
    },
  };
};

export const saveUploadedCandidateResume = async (
  candidateUserId: string,
  uploadedAsset: ResumeAsset,
): Promise<ServiceResult<null, null, ResumeStorageIntegrationPayload | null>> => {
  const existingProfile = await findCandidateProfileByUserId(candidateUserId);
  const previousResumePublicId =
    existingProfile?.resumePublicId ?? APPLICATION_CONSTANTS.EMPTY_STRING;

  await updateCandidateResumeAsset(candidateUserId, uploadedAsset);

  return {
    data: null,
    integrationPayload:
      previousResumePublicId && previousResumePublicId !== uploadedAsset.public_id
        ? {
            kind: 'deleteResume',
            existingResumePublicId: previousResumePublicId,
          }
        : null,
  };
};
