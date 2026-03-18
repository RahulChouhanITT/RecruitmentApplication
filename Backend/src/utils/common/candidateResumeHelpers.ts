import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../configuration/cloudinaryConfiguration";
import { ApplicationError, APPLICATION_CONSTANTS, APPLICATION_MESSAGES, isCloudinaryEnvironmentConfigured } from "../index";
import type { UploadedResumeFile } from "../types/candidateTypes";

const MAX_RESUME_SIZE_BYTES = APPLICATION_CONSTANTS.RESUME_MAX_SIZE_BYTES;
const ALLOWED_RESUME_MIME_TYPES = new Set<string>(APPLICATION_CONSTANTS.RESUME_ALLOWED_MIME_TYPES);

export const validateResumeFile = (file?: UploadedResumeFile): UploadedResumeFile => {
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

export const uploadResumeToCloudinary = async (file: UploadedResumeFile) => {
  if (!isCloudinaryEnvironmentConfigured()) {
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

export const deleteResumeFromCloudinary = async (publicId: string): Promise<void> => {
  if (!publicId || !isCloudinaryEnvironmentConfigured()) {
    return;
  }

  const rawDeleteResult = await cloudinary.uploader.destroy(publicId, {
    resource_type: APPLICATION_CONSTANTS.CLOUDINARY.RESOURCE_TYPES[0],
  });

  if (rawDeleteResult.result === APPLICATION_CONSTANTS.CLOUDINARY.RESULT_NOT_FOUND) {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: APPLICATION_CONSTANTS.CLOUDINARY.RESOURCE_TYPES[1],
    });
  }
};
