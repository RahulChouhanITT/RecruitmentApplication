import { google, type calendar_v3 } from 'googleapis';
import { env } from '../../configuration/env';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';

type GoogleCalendarCredentials = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string;
  calendarId: string;
};

type CreateGoogleMeetEventInput = {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
};

const getGoogleCalendarCredentials = (): GoogleCalendarCredentials => {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const redirectUri = env.GOOGLE_REDIRECT_URI;
  const refreshToken = env.GOOGLE_REFRESH_TOKEN;
  const calendarId = env.GOOGLE_CALENDAR_ID;

  const missingKeys = [
    !clientId ? 'GOOGLE_CLIENT_ID' : null,
    !clientSecret ? 'GOOGLE_CLIENT_SECRET' : null,
    !redirectUri ? 'GOOGLE_REDIRECT_URI' : null,
    !refreshToken ? 'GOOGLE_REFRESH_TOKEN' : null,
    !calendarId ? 'GOOGLE_CALENDAR_ID' : null,
  ].filter(Boolean) as string[];

  if (missingKeys.length > 0) {
    throw new ApplicationError(
      `Google Calendar is not configured. Missing: ${missingKeys.join(', ')}`,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    );
  }

  return {
    clientId: clientId!,
    clientSecret: clientSecret!,
    redirectUri: redirectUri!,
    refreshToken: refreshToken!,
    calendarId: calendarId!,
  };
};

const createGoogleCalendarClient = (credentials: GoogleCalendarCredentials) => {
  const auth = new google.auth.OAuth2(
    credentials.clientId,
    credentials.clientSecret,
    credentials.redirectUri,
  );
  auth.setCredentials({ refresh_token: credentials.refreshToken });

  return google.calendar({ version: 'v3', auth });
};

const resolveGoogleMeetLink = (createdEvent: calendar_v3.Schema$Event): string | null => {
  return (
    createdEvent.hangoutLink ??
    createdEvent.conferenceData?.entryPoints?.find(
      (entryPoint: calendar_v3.Schema$EntryPoint) => entryPoint.entryPointType === 'video',
    )?.uri ??
    null
  );
};

export const createGoogleMeetEvent = async ({
  summary,
  description,
  startDateTime,
  endDateTime,
}: CreateGoogleMeetEventInput): Promise<string> => {
  const credentials = getGoogleCalendarCredentials();
  const calendarClient = createGoogleCalendarClient(credentials);

  const createdEvent = await calendarClient.events.insert({
    calendarId: credentials.calendarId,
    conferenceDataVersion: 1,
    requestBody: {
      summary,
      description,
      start: {
        dateTime: startDateTime,
        timeZone: APPLICATION_CONSTANTS.GOOGLE_OAUTH.TIMEZONE,
      },
      end: {
        dateTime: endDateTime,
        timeZone: APPLICATION_CONSTANTS.GOOGLE_OAUTH.TIMEZONE,
      },
      conferenceData: {
        createRequest: {
          requestId: `${APPLICATION_CONSTANTS.GOOGLE_OAUTH.REQUEST_ID_PREFIX}${Date.now()}`,
          conferenceSolutionKey: {
            type: APPLICATION_CONSTANTS.GOOGLE_OAUTH.CONFERENCE_SOLUTION_TYPE,
          },
        },
      },
    },
  });

  const meetLink = resolveGoogleMeetLink(createdEvent.data);
  if (!meetLink) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.GOOGLE_OAUTH.MEET_LINK_GENERATION_FAILED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    );
  }

  return meetLink;
};
