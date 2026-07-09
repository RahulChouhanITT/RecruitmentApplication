import { env } from '../../configuration/env';

export const isCloudinaryEnvironmentConfigured = (): boolean => {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
};
