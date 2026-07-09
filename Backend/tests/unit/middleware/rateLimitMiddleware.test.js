"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const rateLimitMiddleware_1 = require("../../../src/middleware/rateLimitMiddleware");
const createRequest = (overrides = {}) => ({
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
    headers: {},
    ...overrides,
});
const createResponse = () => ({
    setHeader: vitest_1.vi.fn(),
});
(0, vitest_1.describe)('createSlidingWindowRateLimiter', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.useFakeTimers();
        vitest_1.vi.setSystemTime(new Date('2026-03-30T10:00:00.000Z'));
        (0, rateLimitMiddleware_1.clearSlidingWindowRateLimiterStore)();
    });
    (0, vitest_1.it)('allows requests within the configured limit', () => {
        const middleware = (0, rateLimitMiddleware_1.createSlidingWindowRateLimiter)({
            maxRequests: 2,
            windowMs: 60000,
            keyPrefix: 'test',
        });
        const req = createRequest();
        const res = createResponse();
        const next = vitest_1.vi.fn();
        middleware(req, res, next);
        middleware(req, res, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledTimes(2);
        (0, vitest_1.expect)(next).toHaveBeenNthCalledWith(1);
        (0, vitest_1.expect)(next).toHaveBeenNthCalledWith(2);
        (0, vitest_1.expect)(res.setHeader.mock.calls).toEqual(vitest_1.expect.arrayContaining([
            ['X-RateLimit-Limit', '2'],
            ['X-RateLimit-Remaining', '1'],
            ['X-RateLimit-Limit', '2'],
            ['X-RateLimit-Remaining', '0'],
        ]));
    });
    (0, vitest_1.it)('blocks requests above the configured sliding-window limit', () => {
        const middleware = (0, rateLimitMiddleware_1.createSlidingWindowRateLimiter)({
            maxRequests: 1,
            windowMs: 60000,
            keyPrefix: 'test',
            message: 'Rate limit exceeded',
        });
        const req = createRequest();
        const res = createResponse();
        const next = vitest_1.vi.fn();
        middleware(req, res, next);
        middleware(req, res, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledTimes(2);
        (0, vitest_1.expect)(next).toHaveBeenNthCalledWith(1);
        (0, vitest_1.expect)(next.mock.calls[1][0]).toMatchObject({
            message: 'Rate limit exceeded',
            statusCode: 429,
        });
        (0, vitest_1.expect)(res.setHeader.mock.calls).toEqual(vitest_1.expect.arrayContaining([
            ['Retry-After', '60'],
            ['X-RateLimit-Limit', '1'],
            ['X-RateLimit-Remaining', '0'],
        ]));
    });
    (0, vitest_1.it)('allows new requests once the sliding window has moved forward', () => {
        const middleware = (0, rateLimitMiddleware_1.createSlidingWindowRateLimiter)({
            maxRequests: 1,
            windowMs: 60000,
            keyPrefix: 'test',
        });
        const req = createRequest();
        const res = createResponse();
        const next = vitest_1.vi.fn();
        middleware(req, res, next);
        vitest_1.vi.advanceTimersByTime(61000);
        middleware(req, res, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledTimes(2);
        (0, vitest_1.expect)(next).toHaveBeenNthCalledWith(1);
        (0, vitest_1.expect)(next).toHaveBeenNthCalledWith(2);
    });
    (0, vitest_1.it)('uses the forwarded IP address and custom key resolver when provided', () => {
        const middleware = (0, rateLimitMiddleware_1.createSlidingWindowRateLimiter)({
            maxRequests: 1,
            windowMs: 60000,
            keyPrefix: 'login',
            keyResolver: (req) => `${req.method}:${req.headers['x-forwarded-for']}`,
        });
        const req = createRequest({
            method: 'POST',
            headers: { 'x-forwarded-for': '10.0.0.5, 10.0.0.6' },
        });
        const res = createResponse();
        const next = vitest_1.vi.fn();
        middleware(req, res, next);
        middleware(req, res, next);
        (0, vitest_1.expect)(next.mock.calls[1][0]).toMatchObject({
            statusCode: 429,
        });
    });
});
