export const HR_INTERVIEW_INITIAL_VALUES = {
  EMPTY_STRING: '',
  SEARCH_QUERY: '',
  SCHEDULE_FORM: {
    selectedDateTime: null,
    durationMinutes: 30,
    interviewerId: '',
    notes: '',
  } as const,
} as const;
