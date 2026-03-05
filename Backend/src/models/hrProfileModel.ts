import { Document, Schema, Types, model } from "mongoose";

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
      default: "",
      trim: true,
    },
    experienceLevel: {
      type: String,
      default: "",
      trim: true,
    },
    department: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const HrProfileModel = model<IHrProfile>("HrProfile", hrProfileSchema);
