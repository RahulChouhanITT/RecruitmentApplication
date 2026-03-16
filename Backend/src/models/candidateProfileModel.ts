import { Document, Schema, Types, model } from "mongoose";
import { MODEL_DEFAULT_VALUES } from "../utils/constants/modelConstants";

export interface ICandidateProfile extends Document {
  userId: Types.ObjectId;
  phone: string;
  resumeUrl: string;
  resumePublicId: string;
  skills: string;
  experienceYears: number;
  currentLocation: string;
  createdAt: Date;
  updatedAt: Date;
}

const candidateProfileSchema = new Schema<ICandidateProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      default: MODEL_DEFAULT_VALUES.EMPTY_STRING,
      trim: true,
    },
    resumeUrl: {
      type: String,
      default: MODEL_DEFAULT_VALUES.EMPTY_STRING,
      trim: true,
    },
    resumePublicId: {
      type: String,
      default: MODEL_DEFAULT_VALUES.EMPTY_STRING,
      trim: true,
    },
    skills: {
      type: String,
      default: MODEL_DEFAULT_VALUES.EMPTY_STRING,
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: MODEL_DEFAULT_VALUES.ZERO,
      min: 0,
    },
    currentLocation: {
      type: String,
      default: MODEL_DEFAULT_VALUES.EMPTY_STRING,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CandidateProfileModel = model<ICandidateProfile>("CandidateProfile", candidateProfileSchema);
