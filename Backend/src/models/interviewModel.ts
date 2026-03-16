import { Document, Schema, Types, model } from "mongoose";
import { MODEL_DEFAULT_VALUES } from "../utils/constants/modelConstants";

export const INTERVIEW_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED"] as const;
export const FEEDBACK_STATUSES = ["PENDING", "NEEDS_REVIEW", "REVIEWED"] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export interface IInterview extends Document {
  applicationId: Types.ObjectId;
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;
  interviewerId?: Types.ObjectId | null;
  interviewerName: string;
  interviewDate: string;
  interviewTime: string;
  meetingLink: string;
  notes?: string;
  status: InterviewStatus;
  feedbackStatus: FeedbackStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const interviewSchema = new Schema<IInterview>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: MODEL_DEFAULT_VALUES.NULL,
    },
    interviewerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    interviewDate: {
      type: String,
      required: true,
      trim: true,
    },
    interviewTime: {
      type: String,
      required: true,
      trim: true,
    },
    meetingLink: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: MODEL_DEFAULT_VALUES.EMPTY_STRING,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: INTERVIEW_STATUSES,
      default: INTERVIEW_STATUSES[0],
    },
    feedbackStatus: {
      type: String,
      enum: FEEDBACK_STATUSES,
      default: FEEDBACK_STATUSES[0],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

interviewSchema.index({ createdBy: 1, interviewDate: 1, interviewTime: 1 });
interviewSchema.index({ candidateId: 1, interviewDate: 1 });

export const InterviewModel = model<IInterview>("Interview", interviewSchema);
