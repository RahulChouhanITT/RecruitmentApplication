import { cloudinary } from "../configuration/cloudinaryConfiguration";
import { CandidateProfileModel } from "../models/candidateProfileModel";
import { ApplicationError, APPLICATION_CONSTANTS, APPLICATION_MESSAGES } from "../utils";
import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { trimValue } from "../utils/helpers";

type UploadedResumeFile = {
  buffer: Buffer;
  size: number;
  mimetype: string;
  originalname: string;
};

const MAX_RESUME_SIZE_BYTES = APPLICATION_CONSTANTS.RESUME_MAX_SIZE_BYTES;
const ALLOWED_RESUME_MIME_TYPES = new Set<string>(APPLICATION_CONSTANTS.RESUME_ALLOWED_MIME_TYPES);

const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
};

const validateResumeFile = (file?: UploadedResumeFile): UploadedResumeFile => {
  if (!file) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CANDIDATE.RESUME_REQUIRED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  if (!ALLOWED_RESUME_MIME_TYPES.has(file.mimetype)) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CANDIDATE.RESUME_INVALID_FORMAT,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  if (file.size > MAX_RESUME_SIZE_BYTES) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CANDIDATE.RESUME_TOO_LARGE,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  return file;
};

const uploadResumeToCloudinary = async (file: UploadedResumeFile) => {
  if (!isCloudinaryConfigured()) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CANDIDATE.CLOUDINARY_NOT_CONFIGURED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }

  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: APPLICATION_CONSTANTS.CLOUDINARY.RESUME_FOLDER,
        resource_type: APPLICATION_CONSTANTS.CLOUDINARY.RESOURCE_TYPE_AUTO,
        filename_override: file.originalname,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error ?? new Error(APPLICATION_MESSAGES.CANDIDATE.CLOUDINARY_UPLOAD_FAILED));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(file.buffer);
  });
};

const deleteResumeFromCloudinary = async (publicId: string): Promise<void> => {
  if (!publicId || !isCloudinaryConfigured()) {
    return;
  }

  const rawDeleteResult = await cloudinary.uploader.destroy(publicId, { resource_type: APPLICATION_CONSTANTS.CLOUDINARY.RESOURCE_TYPES[0] });
  if (rawDeleteResult.result === APPLICATION_CONSTANTS.CLOUDINARY.RESULT_NOT_FOUND) {
    await cloudinary.uploader.destroy(publicId, { resource_type: APPLICATION_CONSTANTS.CLOUDINARY.RESOURCE_TYPES[1] });
  }
};

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

  return profile;
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

  return profile;
};
