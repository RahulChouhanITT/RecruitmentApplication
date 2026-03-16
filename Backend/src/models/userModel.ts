import bcrypt from "bcryptjs";
import { Document, Model, Schema, model } from "mongoose";
import { MODEL_DEFAULT_VALUES, USER_MODEL_CONSTANTS } from "../utils/constants/modelConstants";
import { MODEL_MESSAGES } from "../utils/messages/modelMessages";
import { USER_ROLES, type UserRole } from "../utils/types/authTypes";

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
        validator: (email: string): boolean => USER_MODEL_CONSTANTS.EMAIL_REGEX.test(email),
        message: MODEL_MESSAGES.USER.INVALID_EMAIL,
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
      enum: USER_ROLES,
      required: true,
    },
    profileCompleted: {
      type: Boolean,
      default: MODEL_DEFAULT_VALUES.FALSE,
    },
    isEmailVerified: {
      type: Boolean,
      default: MODEL_DEFAULT_VALUES.FALSE,
    },
    isApproved: {
      type: Boolean,
      default: MODEL_DEFAULT_VALUES.FALSE,
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

  this.passwordHash = await bcrypt.hash(this.passwordHash, USER_MODEL_CONSTANTS.PASSWORD_SALT_ROUNDS);
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const UserModel = model<IUser, IUserModel>("User", userSchema);
