import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import { CONFIGURATION_MESSAGES } from '../utils/messages/configurationMessages';

const cloudName = env.CLOUDINARY_CLOUD_NAME;
const apiKey = env.CLOUDINARY_API_KEY;
const apiSecret = env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  process.stdout.write(`${CONFIGURATION_MESSAGES.CLOUDINARY.INITIALIZED}\n`);
} else {
  console.warn(CONFIGURATION_MESSAGES.CLOUDINARY.NOT_INITIALIZED);
}

export { cloudinary };
