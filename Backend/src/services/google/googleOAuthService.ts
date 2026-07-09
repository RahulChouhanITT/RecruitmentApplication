import crypto from 'crypto';
import { google } from 'googleapis';
import { env } from '../../configuration/env';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';

const createGoogleOAuthClient = () => {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const redirectUri = env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.GOOGLE_OAUTH.NOT_CONFIGURED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

const generateGoogleOAuthState = (): string => {
  return crypto.randomBytes(APPLICATION_CONSTANTS.GOOGLE_OAUTH.STATE_BYTE_LENGTH).toString('hex');
};

export const generateGoogleAuthUrl = (): string => {
  const oauthClient = createGoogleOAuthClient();

  return oauthClient.generateAuthUrl({
    access_type: APPLICATION_CONSTANTS.GOOGLE_OAUTH.ACCESS_TYPE_OFFLINE,
    prompt: APPLICATION_CONSTANTS.GOOGLE_OAUTH.PROMPT_CONSENT,
    scope: [APPLICATION_CONSTANTS.GOOGLE_OAUTH.CALENDAR_SCOPE],
    state: generateGoogleOAuthState(),
  });
};

export const exchangeCodeForToken = async (code: string): Promise<string> => {
  const oauthClient = createGoogleOAuthClient();

  try {
    const tokenResponse = await oauthClient.getToken(code);
    const refreshToken = tokenResponse.tokens.refresh_token;

    if (!refreshToken) {
      throw new ApplicationError(
        APPLICATION_MESSAGES.GOOGLE_OAUTH.REFRESH_TOKEN_MISSING,
        APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
      );
    }

    return refreshToken;
  } catch (error) {
    const googleError = error as {
      response?: {
        data?: {
          error?: string;
        };
      };
    };

    if (
      googleError.response?.data?.error === APPLICATION_CONSTANTS.GOOGLE_OAUTH.INVALID_GRANT_ERROR
    ) {
      throw new ApplicationError(
        APPLICATION_MESSAGES.GOOGLE_OAUTH.SESSION_EXPIRED,
        APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
      );
    }

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      APPLICATION_MESSAGES.GOOGLE_OAUTH.AUTHORIZATION_FAILED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    );
  }
};
