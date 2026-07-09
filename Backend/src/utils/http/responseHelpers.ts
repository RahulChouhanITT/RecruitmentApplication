import type { Response } from 'express';

type SuccessResponseOptions<TData = unknown, TPagination = unknown> = {
  statusCode: number;
  message: string;
  data?: TData;
  pagination?: TPagination;
};

export const sendSuccessResponse = <TData = unknown, TPagination = unknown>(
  res: Response,
  options: SuccessResponseOptions<TData, TPagination>,
): void => {
  const { statusCode, message, data, pagination } = options;

  res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
    ...(pagination !== undefined ? { pagination } : {}),
  });
};

type ErrorResponseOptions = {
  statusCode: number;
  message: string;
  stack?: string;
};

export const sendErrorResponse = (res: Response, options: ErrorResponseOptions): void => {
  const { statusCode, message, stack } = options;

  res.status(statusCode).json({
    success: false,
    message,
    ...(stack ? { stack } : {}),
  });
};
