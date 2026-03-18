import type { Request, Response } from "express";
import { google } from "googleapis";
import { APPLICATION_CONSTANTS } from "../utils/constants/applicationConstants";
import { CONFIGURATION_CONSTANTS } from "../utils/constants/configurationConstants";
import { ApplicationError } from "../utils/errors/applicationError";
import { isNonEmptyString, sendSuccessResponse } from "../utils";
import { APPLICATION_MESSAGES } from "../utils/messages/applicationMessages";
import type { GoogleOAuthCodeQuery } from "../utils/types/googleOAuthTypes";

const createOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.GOOGLE_OAUTH.NOT_CONFIGURED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

export const getGoogleOAuthUrl = async (_req: Request, res: Response): Promise<void> => {
  const oauthClient = createOAuthClient();

  const url = oauthClient.generateAuthUrl({
    access_type: APPLICATION_CONSTANTS.GOOGLE_OAUTH.ACCESS_TYPE_OFFLINE,
    prompt: APPLICATION_CONSTANTS.GOOGLE_OAUTH.PROMPT_CONSENT,
    scope: [APPLICATION_CONSTANTS.GOOGLE_OAUTH.CALENDAR_SCOPE],
  });

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.GOOGLE_OAUTH.URL_GENERATED,
    data: { url },
  });
};

export const googleOAuthCallback = async (req: Request<unknown, unknown, unknown, GoogleOAuthCodeQuery>, res: Response): Promise<void> => {
  const { code } = req.query;

  if (!isNonEmptyString(code)) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.GOOGLE_OAUTH.MISSING_CODE,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  const oauthClient = createOAuthClient();
  const tokenResponse = await oauthClient.getToken(code);
  const refreshToken = tokenResponse.tokens.refresh_token;

  if (!refreshToken) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.GOOGLE_OAUTH.REFRESH_TOKEN_MISSING,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.GOOGLE_OAUTH.AUTHORIZATION_SUCCESS,
    data: {
      refreshToken,
      note: APPLICATION_MESSAGES.GOOGLE_OAUTH.REFRESH_TOKEN_NOTE,
    },
  });
};
