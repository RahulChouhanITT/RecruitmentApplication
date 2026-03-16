import { Document, Schema, Types, model } from "mongoose";
import { MODEL_DEFAULT_VALUES } from "../utils/constants/modelConstants";

export interface IInterviewerProfile extends Document {
  userId: Types.ObjectId;
  position: string;
  techStack: string;
  experienceLevel: string;
  createdAt: Date;
  updatedAt: Date;
}

const interviewerProfileSchema = new Schema<IInterviewerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    position: {
      type: String,
      default: MODEL_DEFAULT_VALUES.EMPTY_STRING,
      trim: true,
    },
    techStack: {
      type: String,
      default: MODEL_DEFAULT_VALUES.EMPTY_STRING,
      trim: true,
    },
    experienceLevel: {
      type: String,
      default: MODEL_DEFAULT_VALUES.EMPTY_STRING,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const InterviewerProfileModel = model<IInterviewerProfile>("InterviewerProfile", interviewerProfileSchema);
