import type { NextFunction, Request, Response } from 'express';
import { ApplicationError } from '../utils/errors/applicationError';
import { APPLICATION_CONSTANTS } from '../utils/constants/applicationConstants';
import { CONFIGURATION_CONSTANTS } from '../utils/constants/configurationConstants';
import { APPLICATION_MESSAGES } from '../utils/messages/applicationMessages';

type SlidingWindowRateLimiterOptions = {
  maxRequests: number;
  windowMs: number;
  message?: string;
  keyPrefix?: string;
  keyResolver?: (req: Request) => string;
};

type RateLimitEntry = {
  timestamps: number[];
};

const rateLimitStore = new Map<string, RateLimitEntry>();

const getClientIp = (req: Request): string => {
  const forwardedForHeader = req.headers['x-forwarded-for'];
  if (typeof forwardedForHeader === 'string') {
    const firstForwardedIp = forwardedForHeader
      .split(',')
      .map((value) => value.trim())
      .find(Boolean);

    if (firstForwardedIp) {
      return firstForwardedIp;
    }
  }

  return req.ip || req.socket.remoteAddress || 'unknown';
};

const pruneExpiredRequests = (timestamps: number[], windowStartTime: number): number[] => {
  return timestamps.filter((timestamp) => timestamp > windowStartTime);
};

export const createSlidingWindowRateLimiter = (options: SlidingWindowRateLimiterOptions) => {
  const {
    maxRequests,
    windowMs,
    message = APPLICATION_MESSAGES.ERROR.TOO_MANY_REQUESTS,
    keyPrefix = CONFIGURATION_CONSTANTS.RATE_LIMIT.KEY_PREFIXES.GLOBAL_API,
    keyResolver = (req) => getClientIp(req),
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const currentTime = Date.now();
    const windowStartTime = currentTime - windowMs;
    const rateLimitKey = `${keyPrefix}:${keyResolver(req)}`;
    const currentEntry = rateLimitStore.get(rateLimitKey) ?? { timestamps: [] };
    const activeTimestamps = pruneExpiredRequests(currentEntry.timestamps, windowStartTime);

    if (activeTimestamps.length >= maxRequests) {
      const oldestActiveTimestamp = activeTimestamps[0] ?? currentTime;
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((oldestActiveTimestamp + windowMs - currentTime) / 1000),
      );

      rateLimitStore.set(rateLimitKey, { timestamps: activeTimestamps });
      res.setHeader(
        CONFIGURATION_CONSTANTS.RATE_LIMIT.HEADERS.RETRY_AFTER,
        retryAfterSeconds.toString(),
      );
      res.setHeader(CONFIGURATION_CONSTANTS.RATE_LIMIT.HEADERS.LIMIT, maxRequests.toString());
      res.setHeader(CONFIGURATION_CONSTANTS.RATE_LIMIT.HEADERS.REMAINING, '0');

      next(
        new ApplicationError(message, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.TOO_MANY_REQUESTS),
      );
      return;
    }

    const nextTimestamps = [...activeTimestamps, currentTime];
    rateLimitStore.set(rateLimitKey, { timestamps: nextTimestamps });
    res.setHeader(CONFIGURATION_CONSTANTS.RATE_LIMIT.HEADERS.LIMIT, maxRequests.toString());
    res.setHeader(
      CONFIGURATION_CONSTANTS.RATE_LIMIT.HEADERS.REMAINING,
      Math.max(0, maxRequests - nextTimestamps.length).toString(),
    );
    next();
  };
};

export const clearSlidingWindowRateLimiterStore = (): void => {
  rateLimitStore.clear();
};
