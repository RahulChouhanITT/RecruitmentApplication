import { Router } from "express";
import { asyncHandler } from "../utils/helpers/asyncHandler";
import { getGoogleOAuthUrl, googleOAuthCallback } from "../controllers/googleOAuthController";
import { GOOGLE_ROUTES } from "../utils/constants/routeConstants";

const googleRouter = Router();

googleRouter.get(GOOGLE_ROUTES.OAUTH_URL, asyncHandler(getGoogleOAuthUrl));
googleRouter.get(
  GOOGLE_ROUTES.OAUTH_CALLBACK,
  asyncHandler(googleOAuthCallback)
);

export default googleRouter;
