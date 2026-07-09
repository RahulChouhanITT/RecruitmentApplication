export const canSubmitChatDraft = (conversationId: string, draft: string): boolean =>
  Boolean(conversationId && draft);
