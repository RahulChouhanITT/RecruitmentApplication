export const AUTH_BLOCKING_ERROR_MATCHERS = {
  NOT_VERIFIED: ['verify your email', 'email not verified'],
  NOT_APPROVED: ['not approved'],
  GOOGLE_REQUIRED: ['continue with google', 'uses google login'],
};

export const AUTH_API_ROUTES = {
  LOGIN: '/api/auth/login',
  GOOGLE: '/api/auth/google',
  REGISTER: '/api/auth/register',
  VERIFY_EMAIL: '/api/auth/verify-email',
  RESEND_OTP: '/api/auth/resend-otp',
  LOGOUT: '/api/auth/logout',
  CURRENT_USER: '/api/auth/me',
} as const;

export const AUTH_ROUTE_PATHS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_EMAIL: '/auth/verify-email',
  DASHBOARD: '/dashboard',
} as const;

export const AUTH_FORM_LIMITS = {
  MAX_NAME_LENGTH: 60,
  MAX_EMAIL_LENGTH: 100,
  MAX_PASSWORD_LENGTH: 64,
  MIN_PASSWORD_LENGTH: 8,
  OTP_LENGTH: 6,
} as const;

export const AUTH_REGEX = {
  EMAIL: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{8,}$/,
  NAME_SANITIZER: /[^A-Za-z\s]/g,
} as const;

export const AUTH_INITIAL_VALUES = {
  EMPTY_STRING: '',
  LOGIN_FORM: {
    email: '',
    password: '',
  },
  REGISTER_FORM: {
    role: 'candidate',
    fullName: '',
    email: '',
    password: '',
  },
  LOGIN_MODAL_STATE: {
    open: false,
    title: '',
    message: '',
  },
  VERIFY_EMAIL: {
    otp: '',
    error: '',
    email: '',
  },
} as const;
