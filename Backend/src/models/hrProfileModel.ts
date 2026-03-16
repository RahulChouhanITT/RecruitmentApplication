import { Document, Schema, Types, model } from "mongoose";
import { MODEL_DEFAULT_VALUES } from "../utils/constants/modelConstants";

export interface IHrProfile extends Document {
  userId: Types.ObjectId;
  position: string;
  experienceLevel: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

const hrProfileSchema = new Schema<IHrProfile>(
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
    experienceLevel: {
      type: String,
      default: MODEL_DEFAULT_VALUES.EMPTY_STRING,
      trim: true,
    },
    department: {
      type: String,
      default: MODEL_DEFAULT_VALUES.EMPTY_STRING,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const HrProfileModel = model<IHrProfile>("HrProfile", hrProfileSchema);
