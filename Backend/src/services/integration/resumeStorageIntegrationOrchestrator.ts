import type { ResumeStorageIntegrationPayload } from '../../utils/types';
import {
  deleteResumeFromCloudinary,
  resolveCloudinaryResumeUrl,
  uploadResumeToCloudinary,
} from './cloudinaryResumeIntegrationService';

export const processResumeIntegration = async (
  integrationPayload: ResumeStorageIntegrationPayload,
) => {
  if (integrationPayload.kind === 'uploadResume') {
    return uploadResumeToCloudinary(integrationPayload.file);
  }

  await deleteResumeFromCloudinary(integrationPayload.existingResumePublicId ?? '');
  return null;
};

export const resolveResumeUrl = async (resumePublicId: string): Promise<string | null> => {
  return resolveCloudinaryResumeUrl(resumePublicId);
};
