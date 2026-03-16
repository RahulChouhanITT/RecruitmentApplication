export const includesAnyAuthError = (message: string, candidates: string[]): boolean => {
  const normalizedMessage = message.toLowerCase();
  return candidates.some((candidate) => normalizedMessage.includes(candidate));
};
