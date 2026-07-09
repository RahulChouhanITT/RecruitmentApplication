import { Document, Schema, Types, model } from 'mongoose';
import { MODEL_DEFAULT_VALUES } from '../utils/constants/modelConstants';
import { JOB_EXPERIENCE_LEVELS } from '../utils/types/jobTypes';

export interface IJob extends Document {
  title: string;
  description: string;
  requiredSkills: string;
  experienceLevel: string;
  createdBy: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    requiredSkills: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    experienceLevel: {
      type: String,
      required: true,
      trim: true,
      enum: JOB_EXPERIENCE_LEVELS,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: MODEL_DEFAULT_VALUES.TRUE,
    },
  },
  {
    timestamps: true,
  },
);

jobSchema.index({ createdBy: 1, createdAt: -1 });
jobSchema.index({ isActive: 1, createdAt: -1 });
jobSchema.index({ title: 1 });
jobSchema.index({ experienceLevel: 1 });

export const JobModel = model<IJob>('Job', jobSchema);
