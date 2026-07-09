import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import {
  clearSlidingWindowRateLimiterStore,
  createSlidingWindowRateLimiter,
} from '../../../src/middleware/rateLimitMiddleware';

const createRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
    headers: {},
    ...overrides,
  }) as Request;

const createResponse = (): Response =>
  ({
    setHeader: vi.fn(),
  }) as unknown as Response;

describe('createSlidingWindowRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-30T10:00:00.000Z'));
    clearSlidingWindowRateLimiterStore();
  });

  it('allows requests within the configured limit', () => {
    const middleware = createSlidingWindowRateLimiter({
      maxRequests: 2,
      windowMs: 60_000,
      keyPrefix: 'test',
    });
    const req = createRequest();
    const res = createResponse();
    const next = vi.fn();

    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenNthCalledWith(1);
    expect(next).toHaveBeenNthCalledWith(2);
    expect((res.setHeader as unknown as ReturnType<typeof vi.fn>).mock.calls).toEqual(
      expect.arrayContaining([
        ['X-RateLimit-Limit', '2'],
        ['X-RateLimit-Remaining', '1'],
        ['X-RateLimit-Limit', '2'],
        ['X-RateLimit-Remaining', '0'],
      ]),
    );
  });

  it('blocks requests above the configured sliding-window limit', () => {
    const middleware = createSlidingWindowRateLimiter({
      maxRequests: 1,
      windowMs: 60_000,
      keyPrefix: 'test',
      message: 'Rate limit exceeded',
    });
    const req = createRequest();
    const res = createResponse();
    const next = vi.fn();

    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenNthCalledWith(1);
    expect(next.mock.calls[1][0]).toMatchObject({
      message: 'Rate limit exceeded',
      statusCode: 429,
    });
    expect((res.setHeader as unknown as ReturnType<typeof vi.fn>).mock.calls).toEqual(
      expect.arrayContaining([
        ['Retry-After', '60'],
        ['X-RateLimit-Limit', '1'],
        ['X-RateLimit-Remaining', '0'],
      ]),
    );
  });

  it('allows new requests once the sliding window has moved forward', () => {
    const middleware = createSlidingWindowRateLimiter({
      maxRequests: 1,
      windowMs: 60_000,
      keyPrefix: 'test',
    });
    const req = createRequest();
    const res = createResponse();
    const next = vi.fn();

    middleware(req, res, next);
    vi.advanceTimersByTime(61_000);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenNthCalledWith(1);
    expect(next).toHaveBeenNthCalledWith(2);
  });

  it('uses the forwarded IP address and custom key resolver when provided', () => {
    const middleware = createSlidingWindowRateLimiter({
      maxRequests: 1,
      windowMs: 60_000,
      keyPrefix: 'login',
      keyResolver: (req) => `${req.method}:${req.headers['x-forwarded-for']}`,
    });
    const req = createRequest({
      method: 'POST',
      headers: { 'x-forwarded-for': '10.0.0.5, 10.0.0.6' },
    });
    const res = createResponse();
    const next = vi.fn();

    middleware(req, res, next);
    middleware(req, res, next);

    expect(next.mock.calls[1][0]).toMatchObject({
      statusCode: 429,
    });
  });
});
