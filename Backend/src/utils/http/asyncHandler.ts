import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

export const asyncHandler = <
  Params = ParamsDictionary,
  ResponseBody = unknown,
  RequestBody = unknown,
  RequestQuery = ParsedQs,
>(
  handler: RequestHandler<Params, ResponseBody, RequestBody, RequestQuery>,
): RequestHandler<Params, ResponseBody, RequestBody, RequestQuery> => {
  return (
    req: Request<Params, ResponseBody, RequestBody, RequestQuery>,
    res: Response<ResponseBody>,
    next: NextFunction,
  ): void => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
