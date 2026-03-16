import { Document, Schema, Types, model } from "mongoose";
import { APPLICATION_STATUSES } from "../utils/types/applicationTypes";

export interface IApplication extends Document {
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
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
    status: {
      type: String,
      default: APPLICATION_STATUSES[0],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export const ApplicationModel = model<IApplication>("Application", applicationSchema, "jobapplications");
