import { getChatErrorMessage } from '../handlers/chatErrorHandler';
import { sanitizeChatDraftForSubmit } from '../utils/chatComposerSanitizers';
import { canSubmitChatDraft } from '../validations/chatValidation';

type SendMessageTrigger = (args: {
  conversationId: string;
  message: string;
}) => PromiseLike<{ unwrap: () => Promise<unknown> }> | { unwrap: () => Promise<unknown> };

type SendChatMessageParams = {
  activeConversationId: string;
  draft: string;
  sendMessage: SendMessageTrigger;
};

export const sendChatMessage = async ({
  activeConversationId,
  draft,
  sendMessage,
}: SendChatMessageParams): Promise<boolean> => {
  const sanitizedDraft = sanitizeChatDraftForSubmit(draft);

  if (!canSubmitChatDraft(activeConversationId, sanitizedDraft)) {
    return false;
  }

  try {
    const request = sendMessage({
      conversationId: activeConversationId,
      message: sanitizedDraft,
    }) as { unwrap: () => Promise<unknown> };

    await request.unwrap();
  } catch (error) {
    throw new Error(getChatErrorMessage(error, 'Unable to send message. Please try again.'));
  }

  return true;
};
