export const getDashboardErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  return typeof error === 'object' && error !== null && 'message' in error
    ? String((error as { message: unknown }).message)
    : fallbackMessage;
};
