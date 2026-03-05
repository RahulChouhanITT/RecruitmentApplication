export const AUTH_BLOCKING_ERROR_MATCHERS = {
  NOT_VERIFIED: ["verify your email", "email not verified"],
  NOT_APPROVED: ["not approved"],
};

export const AUTH_LOADER_MESSAGES = {
  LOADING_AUTHENTICATION: "Loading authentication...",
  CHECKING_SESSION: "Checking session...",
} as const;
