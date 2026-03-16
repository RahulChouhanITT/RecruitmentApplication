export const CANDIDATE_API_ROUTES = {
  RESUME: "/api/candidate/resume",
} as const;

export const CANDIDATE_API_DEFAULTS = {
  RESUME_FORM_FIELD: "resume",
  MULTIPART_CONTENT_TYPE: "multipart/form-data",
} as const;

export const CANDIDATE_DATE_FORMAT = {
  LOCALE: "en-GB",
  OPTIONS: {
    day: "2-digit",
    month: "short",
    year: "numeric",
  },
} as const;
