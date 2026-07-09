import type { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../../configuration/cloudinaryConfiguration';
import { isCloudinaryEnvironmentConfigured } from '../../utils/config/environmentHelpers';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import type { UploadedResumeFile } from '../../utils/types/candidateTypes';

export const uploadResumeToCloudinary = async (file: UploadedResumeFile) => {
  if (!isCloudinaryEnvironmentConfigured()) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CANDIDATE.CLOUDINARY_NOT_CONFIGURED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
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
      },
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

export const resolveCloudinaryResumeUrl = async (
  resumePublicId: string,
): Promise<string | null> => {
  if (!resumePublicId || !isCloudinaryEnvironmentConfigured()) {
    return null;
  }

  const resourceTypes: Array<'raw' | 'image'> = [
    ...APPLICATION_CONSTANTS.CLOUDINARY.RESOURCE_TYPES,
  ];

  for (const resourceType of resourceTypes) {
    try {
      const resource = await cloudinary.api.resource(resumePublicId, {
        resource_type: resourceType,
      });
      if (resource?.secure_url) {
        return resource.secure_url;
      }
    } catch (error) {
      const isNotFound =
        typeof error === 'object' &&
        error !== null &&
        'http_code' in error &&
        (error as { http_code?: number }).http_code ===
          APPLICATION_CONSTANTS.CLOUDINARY.ERROR_CODES.NOT_FOUND;

      if (!isNotFound) {
        break;
      }
    }
  }

  return null;
};
