import mongoose from 'mongoose';
import { env } from './env';
import { APPLICATION_MESSAGES } from '../utils/messages/applicationMessages';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI);
    process.stdout.write(`${APPLICATION_MESSAGES.DATABASE.CONNECTION_SUCCESS}\n`);
  } catch (error) {
    console.error(APPLICATION_MESSAGES.DATABASE.CONNECTION_ERROR);
    console.error((error as Error).message);
  }
};
