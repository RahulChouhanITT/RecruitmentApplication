import bcrypt from "bcryptjs";
import { Document, Model, Schema, model } from "mongoose";
import type { UserRole } from "../utils/types/authTypes";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  profileCompleted: boolean;
  isEmailVerified: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {}

const userSchema = new Schema<IUser, IUserModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email: string): boolean => EMAIL_REGEX.test(email),
        message: "Please provide a valid email address",
      },
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["hr", "candidate", "interviewer"],
      required: true,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function onUserSave(): Promise<void> {
  if (!this.isModified("passwordHash")) {
    return;
  }

  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const UserModel = model<IUser, IUserModel>("User", userSchema);
