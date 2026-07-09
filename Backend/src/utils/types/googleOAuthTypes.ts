export interface GoogleOAuthCodeQuery {
  code?: string;
  state?: string;
  error?: string;
}

export interface GoogleAuthStartQuery {
  role?: string;
}
