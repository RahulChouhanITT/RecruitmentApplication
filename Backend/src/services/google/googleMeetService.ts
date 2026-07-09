import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';

type GoogleMeetLinkPayload = {
  kind: 'googleMeetEvent';
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
};

type CreateGoogleMeetEventHandler = (payload: {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
}) => Promise<string>;

export const createGoogleMeetLink = async (
  integrationPayload: GoogleMeetLinkPayload,
  createGoogleMeetEvent: CreateGoogleMeetEventHandler,
): Promise<string> => {
  if (integrationPayload.kind !== 'googleMeetEvent') {
    throw new ApplicationError(
      APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    );
  }

  return createGoogleMeetEvent(integrationPayload);
};
