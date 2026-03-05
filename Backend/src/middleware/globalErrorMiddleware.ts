import type { ErrorRequestHandler } from "express";
import { ApplicationError } from "../utils/errors/applicationError";
import { APPLICATION_MESSAGES } from "../utils/messages/applicationMessages";

export const globalErrorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  const isKnownError = error instanceof ApplicationError;
  const statusCode = isKnownError ? error.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
    ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {}),
  });
};
