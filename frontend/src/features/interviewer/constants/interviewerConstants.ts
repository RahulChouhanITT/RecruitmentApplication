export const INTERVIEWER_INITIAL_VALUES = {
  EMPTY_STRING: '',
  FEEDBACK_FORM: {
    rating: '',
    recommendation: '',
    comments: '',
  },
} as const;

export const INTERVIEWER_STATUS_VALUES = {
  COMPLETED: 'COMPLETED',
  ALL: 'all',
  UPCOMING: 'upcoming',
  COMPLETED_FILTER: 'completed',
  HIRED: 'HIRED',
  REJECTED: 'REJECTED',
} as const;
