import { ApplicationError, APPLICATION_CONSTANTS, APPLICATION_MESSAGES } from "../utils";
const { google } = require("googleapis") as { google: any };

type CreateGoogleMeetEventInput = {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
};

const getGoogleCalendarCredentials = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();

  const missingKeys = [
    !clientId ? "GOOGLE_CLIENT_ID" : null,
    !clientSecret ? "GOOGLE_CLIENT_SECRET" : null,
    !redirectUri ? "GOOGLE_REDIRECT_URI" : null,
    !refreshToken ? "GOOGLE_REFRESH_TOKEN" : null,
    !calendarId ? "GOOGLE_CALENDAR_ID" : null,
  ].filter(Boolean) as string[];

  if (missingKeys.length > 0) {
    throw new ApplicationError(
      `Google Calendar is not configured. Missing: ${missingKeys.join(", ")}`,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }

  return { clientId, clientSecret, redirectUri, refreshToken, calendarId };
};

export const createGoogleMeetEvent = async ({
  summary,
  description,
  startDateTime,
  endDateTime,
}: CreateGoogleMeetEventInput): Promise<string> => {
  const { clientId, clientSecret, redirectUri, refreshToken, calendarId } = getGoogleCalendarCredentials();

  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  auth.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: "v3", auth });

  const createdEvent = await calendar.events.insert({
    calendarId,
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
          conferenceSolutionKey: { type: APPLICATION_CONSTANTS.GOOGLE_OAUTH.CONFERENCE_SOLUTION_TYPE },
        },
      },
    },
  });

  const meetLink =
    createdEvent.data.hangoutLink ??
    createdEvent.data.conferenceData?.entryPoints?.find(
      (entryPoint: { entryPointType?: string; uri?: string }) => entryPoint.entryPointType === "video"
    )?.uri;

  if (!meetLink) {
    throw new ApplicationError(APPLICATION_MESSAGES.GOOGLE_OAUTH.MEET_LINK_GENERATION_FAILED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  return meetLink;
};
