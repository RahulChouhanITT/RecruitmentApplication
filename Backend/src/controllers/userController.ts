import type { Request, Response } from 'express';
import { APPLICATION_CONSTANTS } from '../utils/constants/applicationConstants';
import { sendSuccessResponse } from '../utils/http/responseHelpers';
import {
  getCurrentUser as getCurrentUserService,
  getUserProfile as getUserProfileService,
} from '../services/user/userReadService';
import {
  completeUserProfile as completeUserProfileService,
  repairCandidateResumeUrl as repairCandidateResumeUrlService,
  updateUserProfile as updateUserProfileService,
} from '../services/user/userProfileMutationService';
import { resolveResumeUrl } from '../services/integration/resumeStorageIntegrationOrchestrator';
import { getAuthenticatedUserId } from './helpers/requestAuthHelpers';
import { APPLICATION_MESSAGES } from '../utils/messages/applicationMessages';
import type {
  AuthenticatedRequest,
  CompleteProfileRequestBody,
  GetOrUpdateProfileRequestBody,
} from '../utils/types/authTypes';

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const currentUser = await getCurrentUserService(authenticatedUserId);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.CURRENT_USER_SUCCESS,
    data: currentUser,
  });
};

export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const userProfileResult = await getUserProfileService(authenticatedUserId);
  let userProfile = userProfileResult.data;

  if (userProfileResult.integrationPayload?.kind === 'resolveResumeUrl') {
    const resolvedResumeUrl = await resolveResumeUrl(
      userProfileResult.integrationPayload.resumePublicId,
    );
    if (resolvedResumeUrl) {
      userProfile = {
        ...userProfile,
        resumeUrl: resolvedResumeUrl,
      };

      if (resolvedResumeUrl !== userProfileResult.integrationPayload.currentResumeUrl) {
        await repairCandidateResumeUrlService(authenticatedUserId, resolvedResumeUrl);
      }
    }
  }

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.PROFILE_FETCHED,
    data: userProfile,
  });
};

export const updateUserProfile = async (
  req: AuthenticatedRequest & Request<unknown, unknown, GetOrUpdateProfileRequestBody>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const updateProfilePayload = req.body;
  await updateUserProfileService(authenticatedUserId, updateProfilePayload);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.PROFILE_UPDATED,
  });
};

export const completeUserProfile = async (
  req: AuthenticatedRequest & Request<unknown, unknown, CompleteProfileRequestBody>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const completeProfilePayload = req.body;
  await completeUserProfileService(authenticatedUserId, completeProfilePayload);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.PROFILE_COMPLETED,
  });
};
