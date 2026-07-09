import { APPLICATION_CONSTANTS } from '../../../utils/constants/applicationConstants';
import { ApplicationError } from '../../../utils/errors/applicationError';
import { APPLICATION_MESSAGES } from '../../../utils/messages/applicationMessages';
import type { UploadedResumeFile } from '../../../utils/types/candidateTypes';

const MAX_RESUME_SIZE_BYTES = APPLICATION_CONSTANTS.RESUME_MAX_SIZE_BYTES;
const ALLOWED_RESUME_MIME_TYPES = new Set<string>(APPLICATION_CONSTANTS.RESUME_ALLOWED_MIME_TYPES);

export const validateResumeFile = (file?: UploadedResumeFile): UploadedResumeFile => {
  if (!file) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CANDIDATE.RESUME_REQUIRED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  if (!ALLOWED_RESUME_MIME_TYPES.has(file.mimetype)) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CANDIDATE.RESUME_INVALID_FORMAT,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  if (file.size > MAX_RESUME_SIZE_BYTES) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CANDIDATE.RESUME_TOO_LARGE,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  return file;
};
