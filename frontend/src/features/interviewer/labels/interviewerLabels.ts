export const INTERVIEWER_DEFAULT_MESSAGES = {
  LOADING_INTERVIEWS: 'Loading interviews...',
  FETCH_INTERVIEWS_FAILED: 'Unable to load interviews right now.',
  NO_INTERVIEWS_TITLE: 'No Interviews',
  NO_INTERVIEWS_DESCRIPTION: 'No interviews assigned yet.',
  NO_INTERVIEWS_FOUND_TITLE: 'No Interviews Found',
  NO_INTERVIEWS_FOUND_DESCRIPTION: 'No interviews for this filter.',
  FEEDBACK_SUBMITTED_SUCCESS: 'Feedback submitted successfully',
  FEEDBACK_SUBMIT_FAILED: 'Failed to submit feedback',
  UNTITLED_JOB: 'Untitled Job',
} as const;

export const INTERVIEWER_UI_TEXT = {
  COMPANY_NAME: 'Recruitment Portal',
  TITLE: 'My Interviews',
  SEARCH_PLACEHOLDER: 'Search by interview title',
  FILTER_ALL: 'All',
  FILTER_UPCOMING: 'Upcoming',
  FILTER_COMPLETED: 'Completed',
  CANDIDATE_LABEL: 'Candidate',
  SUBMIT_FEEDBACK: 'Submit Feedback',
  FEEDBACK_MODAL_TITLE: 'Submit Feedback',
  RATING_LABEL: 'Rating (1-5)',
  RATING_PLACEHOLDER: 'Select rating',
  RECOMMENDATION_LABEL: 'Recommendation',
  RECOMMENDATION_PLACEHOLDER: 'Select recommendation',
  RECOMMENDATION_HIRED: 'Hired',
  RECOMMENDATION_REJECTED: 'Rejected',
  COMMENTS_LABEL: 'Comments',
  COMMENTS_PLACEHOLDER: 'Optional feedback comments',
  CANCEL: 'Cancel',
  SUBMITTING: 'Submitting...',
  FIELD_ERROR_PLACEHOLDER: '\u00A0',
} as const;

export const INTERVIEWER_VALIDATION_MESSAGES = {
  RATING_REQUIRED: 'Rating is required',
  RECOMMENDATION_REQUIRED: 'Recommendation is required',
} as const;
