import type { Request, Response } from "express";
import { deleteCandidateResume, uploadCandidateResume } from "../services/candidateService";
import { APPLICATION_CONSTANTS } from "../utils/constants/applicationConstants";
import { sendSuccessResponse } from "../utils";
import { APPLICATION_MESSAGES } from "../utils/messages/applicationMessages";
import type { AuthenticatedRequest } from "../utils/types/authTypes";
import type { UploadedResumeFile } from "../utils/types/candidateTypes";

export const uploadResumeHandler = async (
  req: AuthenticatedRequest & Request,
  res: Response
): Promise<void> => {
  const requestWithFile = req as AuthenticatedRequest & Request & { file?: UploadedResumeFile };
  await uploadCandidateResume(req.authenticatedUserId as string, requestWithFile.file);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.CANDIDATE.RESUME_UPLOADED,
    
  });
};

export const deleteResumeHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  await deleteCandidateResume(req.authenticatedUserId as string);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.CANDIDATE.RESUME_DELETED,
  });
};
