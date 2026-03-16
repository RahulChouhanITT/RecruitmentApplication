import { CANDIDATE_DATE_FORMAT } from "../constants/candidateConstants";
import { CANDIDATE_DEFAULT_MESSAGES } from "../labels/candidateLabels";

export const formatAppliedDate = (date: string): string => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return CANDIDATE_DEFAULT_MESSAGES.INVALID_DATE_FALLBACK;
  }

  return parsedDate.toLocaleDateString(CANDIDATE_DATE_FORMAT.LOCALE, CANDIDATE_DATE_FORMAT.OPTIONS);
};
