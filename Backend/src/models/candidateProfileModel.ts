import { Document, Schema, Types, model } from "mongoose";

export interface ICandidateProfile extends Document {
  userId: Types.ObjectId;
  phone: string;
  resumeUrl: string;
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
      default: "",
      trim: true,
    },
    resumeUrl: {
      type: String,
      default: "",
      trim: true,
    },
    skills: {
      type: String,
      default: "",
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentLocation: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CandidateProfileModel = model<ICandidateProfile>("CandidateProfile", candidateProfileSchema);
