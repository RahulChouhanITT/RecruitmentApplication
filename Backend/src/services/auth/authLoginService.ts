import { Types } from 'mongoose';
import { UserModel } from '../../models/userModel';
import { AUTH_LOGIN_FIELDS, AUTH_SAFE_USER_FIELDS } from '../../utils/constants';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { assertEntityExists } from '../../utils/common/entityHelpers';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import { normalizeEmailAddress } from '../../utils/common/stringHelpers';
import { validateLoginInput } from '../../utils/auth';
import type { LoginRequestBody } from '../../utils/types';
import type { ServiceResult } from '../../utils/types';

const fetchSafeUserById = async (userId: Types.ObjectId) => {
  const safeUser = await UserModel.findById(userId).select(AUTH_SAFE_USER_FIELDS).lean();
  assertEntityExists(
    safeUser,
    APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
    APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
  );
  return safeUser;
};

const findUserForLoginByEmail = async (email: string) => {
  return UserModel.findOne({ email }).select(AUTH_LOGIN_FIELDS);
};

export const loginUser = async (
  loginInput: LoginRequestBody,
): Promise<ServiceResult<Awaited<ReturnType<typeof fetchSafeUserById>>>> => {
  validateLoginInput(loginInput);

  const user = await findUserForLoginByEmail(normalizeEmailAddress(loginInput.email));
  assertEntityExists(
    user,
    APPLICATION_MESSAGES.AUTH.INVALID_CREDENTIALS,
    APPLICATION_CONSTANTS.HTTP_STATUS_CODES.UNAUTHORIZED,
  );

  if (user.authProvider === 'google' && !user.passwordHash) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.AUTH.GOOGLE_LOGIN_REQUIRED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN,
    );
  }

  const isPasswordMatching = await user.comparePassword(loginInput.password);
  if (!isPasswordMatching) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.AUTH.INVALID_CREDENTIALS,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.UNAUTHORIZED,
    );
  }

  if (!user.isEmailVerified) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.AUTH.EMAIL_NOT_VERIFIED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN,
    );
  }

  if (!user.isApproved) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.AUTH.USER_NOT_APPROVED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN,
    );
  }

  return {
    data: await fetchSafeUserById(user._id as Types.ObjectId),
  };
};
