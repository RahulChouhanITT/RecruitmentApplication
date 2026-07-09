import { getChatErrorMessage } from '../handlers/chatErrorHandler';

type MarkSeenTrigger = (args: {
  conversationId: string;
}) => PromiseLike<{ unwrap: () => Promise<unknown> }> | { unwrap: () => Promise<unknown> };

export const markConversationSeen = async (
  markSeen: MarkSeenTrigger,
  conversationId: string,
): Promise<void> => {
  if (!conversationId) {
    return;
  }

  try {
    const request = markSeen({ conversationId }) as { unwrap: () => Promise<unknown> };
    await request.unwrap();
  } catch (error) {
    throw new Error(getChatErrorMessage(error, 'Unable to update read status right now.'));
  }
};
