import { Router } from 'express';
import { asyncHandler } from '../utils/http/asyncHandler';
import {
  generateGoogleAuthUrl,
  handleGoogleOAuthCallback,
} from '../controllers/googleOAuthController';
import { GOOGLE_ROUTES } from '../utils/constants/routeConstants';

const googleRouter = Router();

googleRouter.get(GOOGLE_ROUTES.OAUTH_URL, asyncHandler(generateGoogleAuthUrl));
googleRouter.get(GOOGLE_ROUTES.OAUTH_CALLBACK, asyncHandler(handleGoogleOAuthCallback));

export default googleRouter;
