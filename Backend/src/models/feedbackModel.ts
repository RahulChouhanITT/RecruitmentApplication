import { Document, Schema, Types, model } from "mongoose";
import { MODEL_DEFAULT_VALUES } from "../utils/constants/modelConstants";
import { FEEDBACK_RECOMMENDATIONS, type FeedbackRecommendation } from "../utils/types/feedbackTypes";

export interface IFeedback extends Document {
  interviewId: Types.ObjectId;
  rating: number;
  comments?: string;
  recommendation: FeedbackRecommendation;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      unique: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
      trim: true,
      default: MODEL_DEFAULT_VALUES.EMPTY_STRING,
      maxlength: 2000,
    },
    recommendation: {
      type: String,
      enum: FEEDBACK_RECOMMENDATIONS,
      required: true,
    },
    submittedAt: {
      type: Date,
      required: true,
      default: MODEL_DEFAULT_VALUES.CURRENT_DATE,
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ interviewId: 1 }, { unique: true });

export const FeedbackModel = model<IFeedback>("Feedback", feedbackSchema);
