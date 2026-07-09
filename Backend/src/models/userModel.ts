import bcrypt from 'bcryptjs';
import { Document, Model, Schema, model } from 'mongoose';
import { MODEL_DEFAULT_VALUES, USER_MODEL_CONSTANTS } from '../utils/constants/modelConstants';
import { MODEL_MESSAGES } from '../utils/messages/modelMessages';
import { AUTH_PROVIDERS, USER_ROLES, type AuthProvider, type UserRole } from '../utils/types/authTypes';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  otpCodeHash?: string;
  otpExpiryTime?: Date | null;
  otpAttemptCount?: number;
  role: UserRole;
  authProvider: AuthProvider;
  googleId?: string;
  avatarUrl?: string;
  profileCompleted: boolean;
  isEmailVerified: boolean;
  isApproved: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type IUserModel = Model<IUser>;

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
      minlength: 8,
      select: false,
    },
    otpCodeHash: {
      type: String,
      select: false,
    },
    otpExpiryTime: {
      type: Date,
      default: MODEL_DEFAULT_VALUES.NULL,
      select: false,
    },
    otpAttemptCount: {
      type: Number,
      default: MODEL_DEFAULT_VALUES.ZERO,
      min: 0,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },
    authProvider: {
      type: String,
      enum: AUTH_PROVIDERS,
      default: 'local',
      required: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
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
    lastLoginAt: {
      type: Date,
      default: MODEL_DEFAULT_VALUES.NULL,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function onUserSave(): Promise<void> {
  if (!this.isModified('passwordHash') || !this.passwordHash) {
    return;
  }

  this.passwordHash = await bcrypt.hash(
    this.passwordHash,
    USER_MODEL_CONSTANTS.PASSWORD_SALT_ROUNDS,
  );
});

userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword: string,
): Promise<boolean> {
  if (!this.passwordHash) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const UserModel = model<IUser, IUserModel>('User', userSchema);
