import { Types } from 'mongoose';

export interface UploadedResumeFile {
  buffer: Buffer;
  size: number;
  mimetype: string;
  originalname: string;
}

export type PopulatedCandidate = {
  _id?: Types.ObjectId;
  name?: string;
  email?: string;
} | null;
