import { Document, Schema, Types, model } from "mongoose";

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
      default: "",
      trim: true,
    },
    techStack: {
      type: String,
      default: "",
      trim: true,
    },
    experienceLevel: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const InterviewerProfileModel = model<IInterviewerProfile>("InterviewerProfile", interviewerProfileSchema);
