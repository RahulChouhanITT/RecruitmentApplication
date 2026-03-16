export const FEEDBACK_RECOMMENDATIONS = ["HIRED", "REJECTED"] as const;
export type FeedbackRecommendation = (typeof FEEDBACK_RECOMMENDATIONS)[number];

export type SubmitFeedbackInput = {
  interviewId: string;
  rating: number;
  comments?: string;
  recommendation: FeedbackRecommendation;
};
