import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { globalErrorMiddleware } from './middleware/globalErrorMiddleware';
import { ApplicationError } from './utils/errors/applicationError';
import authRouter from './routes/authRoutes';
import jobRouter from './routes/jobRoutes';
import candidateRouter from './routes/candidateRoutes';
import applicationRouter from './routes/applicationRoutes';
import interviewRouter from './routes/interviewRoutes';
import feedbackRouter from './routes/feedbackRoutes';
import googleRouter from './routes/googleRoutes';
import chatRouter from './routes/chatRoutes';
import notificationRouter from './routes/notificationRoutes';
import { APPLICATION_MESSAGES } from './utils/messages/applicationMessages';
import { CONFIGURATION_CONSTANTS } from './utils/constants/configurationConstants';
import { API_ROUTE_PREFIXES } from './utils/constants/routeConstants';
import { APPLICATION_CONSTANTS } from './utils/constants/applicationConstants';
import { registerNotificationHandler } from './services/notification/notification.handler';
import { createSlidingWindowRateLimiter } from './middleware/rateLimitMiddleware';
import { env } from './configuration/env';

const app = express();
const globalApiRateLimiter = createSlidingWindowRateLimiter({
  ...CONFIGURATION_CONSTANTS.RATE_LIMIT.POLICIES.GLOBAL_API,
  keyPrefix: CONFIGURATION_CONSTANTS.RATE_LIMIT.KEY_PREFIXES.GLOBAL_API,
});

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(globalApiRateLimiter);

app.get(API_ROUTE_PREFIXES.HEALTH, (_req: Request, res: Response) => {
  res.status(APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK).json({
    status: 'ok',
    service: 'backend',
    environment: env.NODE_ENV,
  });
});

app.use(API_ROUTE_PREFIXES.AUTH, authRouter);
app.use(API_ROUTE_PREFIXES.JOBS, jobRouter);
app.use(API_ROUTE_PREFIXES.CANDIDATE, candidateRouter);
app.use(API_ROUTE_PREFIXES.APPLICATIONS, applicationRouter);
app.use(API_ROUTE_PREFIXES.INTERVIEWS, interviewRouter);
app.use(API_ROUTE_PREFIXES.FEEDBACK, feedbackRouter);
app.use(API_ROUTE_PREFIXES.GOOGLE, googleRouter);
app.use(API_ROUTE_PREFIXES.CHATS, chatRouter);
app.use(API_ROUTE_PREFIXES.NOTIFICATIONS, notificationRouter);

registerNotificationHandler();

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(
    new ApplicationError(
      APPLICATION_MESSAGES.ERROR.ROUTE_NOT_FOUND,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
    ),
  );
});

app.use(globalErrorMiddleware);

export default app;
