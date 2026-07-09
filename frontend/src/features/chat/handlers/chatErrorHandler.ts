type ChatErrorLike = {
  data?: {
    message?: string;
  };
  message?: string;
};

export const getChatErrorMessage = (
  error: unknown,
  fallbackMessage = 'Something went wrong. Please try again.',
): string => {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error && typeof error === 'object') {
    const chatError = error as ChatErrorLike;

    if (typeof chatError.data?.message === 'string' && chatError.data.message.trim()) {
      return chatError.data.message;
    }

    if (typeof chatError.message === 'string' && chatError.message.trim()) {
      return chatError.message;
    }
  }

  return fallbackMessage;
};
