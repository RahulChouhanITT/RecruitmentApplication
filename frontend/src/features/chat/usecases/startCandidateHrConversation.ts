import { getChatErrorMessage } from '../handlers/chatErrorHandler';
import type { ChatApiResponse, ChatConversation } from '../../../types/chatTypes';

type StartCandidateHrConversationTrigger = () => PromiseLike<{
  unwrap: () => Promise<ChatApiResponse<ChatConversation>>;
}> | {
  unwrap: () => Promise<ChatApiResponse<ChatConversation>>;
};

export const startCandidateHrConversation = async (
  startConversation: StartCandidateHrConversationTrigger,
): Promise<string> => {
  try {
    const request = startConversation() as {
      unwrap: () => Promise<ChatApiResponse<ChatConversation>>;
    };
    const response = await request.unwrap();
    return response.data?._id ?? '';
  } catch (error) {
    throw new Error(
      getChatErrorMessage(error, 'Unable to start a conversation with HR right now.'),
    );
  }
};
