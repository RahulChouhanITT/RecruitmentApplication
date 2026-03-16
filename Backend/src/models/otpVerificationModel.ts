import { Document, Schema, Types, model } from "mongoose";
import { MODEL_DEFAULT_VALUES } from "../utils/constants/modelConstants";

export interface IOtpVerification extends Document {
  userId: Types.ObjectId;
  otpCodeHash: string;
  expiryTime: Date;
  isUsed: boolean;
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const otpVerificationSchema = new Schema<IOtpVerification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    otpCodeHash: {
      type: String,
      required: true,
      select: false,
    },
    expiryTime: {
      type: Date,
      required: true,
      index: true,
    },
    isUsed: {
      type: Boolean,
      default: MODEL_DEFAULT_VALUES.FALSE,
    },
    attemptCount: {
      type: Number,
      default: MODEL_DEFAULT_VALUES.ZERO,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

otpVerificationSchema.index({ userId: 1, isUsed: 1, createdAt: -1 });

export const OtpVerificationModel = model<IOtpVerification>("OtpVerification", otpVerificationSchema);
