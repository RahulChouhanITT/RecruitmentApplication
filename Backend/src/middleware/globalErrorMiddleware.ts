import type { ErrorRequestHandler } from 'express';
import { APPLICATION_CONSTANTS } from '../utils/constants/applicationConstants';
import { ApplicationError } from '../utils/errors/applicationError';
import { sendErrorResponse } from '../utils/http/responseHelpers';
import { APPLICATION_MESSAGES } from '../utils/messages/applicationMessages';

export const globalErrorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  const isKnownError = error instanceof ApplicationError;
  const statusCode = isKnownError
    ? error.statusCode
    : APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

  sendErrorResponse(res, {
    statusCode,
    message: error.message || APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
  });
};
