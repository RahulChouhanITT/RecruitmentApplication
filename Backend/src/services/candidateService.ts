import { CandidateProfileModel } from "../models/candidateProfileModel";
import { APPLICATION_CONSTANTS, deleteResumeFromCloudinary, uploadResumeToCloudinary, validateResumeFile } from "../utils";
import type { UploadedResumeFile } from "../utils/types/candidateTypes";

export const uploadCandidateResume = async (candidateUserId: string, file?: UploadedResumeFile) => {
  const validatedFile = validateResumeFile(file);

  const profile = await CandidateProfileModel.findOneAndUpdate(
    { userId: candidateUserId },
    { $setOnInsert: { userId: candidateUserId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (profile.resumePublicId) {
    try {
      await deleteResumeFromCloudinary(profile.resumePublicId);
    } catch (_error) {
    }
  }

  const uploadedAsset = await uploadResumeToCloudinary(validatedFile);

  profile.resumeUrl = uploadedAsset.secure_url;
  profile.resumePublicId = uploadedAsset.public_id;
  await profile.save();

  return ;
};

export const deleteCandidateResume = async (candidateUserId: string) => {
  const profile = await CandidateProfileModel.findOneAndUpdate(
    { userId: candidateUserId },
    { $setOnInsert: { userId: candidateUserId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (profile.resumePublicId) {
    try {
      await deleteResumeFromCloudinary(profile.resumePublicId);
    } catch (_error) {
    }
  }

  profile.resumeUrl = APPLICATION_CONSTANTS.EMPTY_STRING;
  profile.resumePublicId = APPLICATION_CONSTANTS.EMPTY_STRING;
  await profile.save();

  return ;
};
