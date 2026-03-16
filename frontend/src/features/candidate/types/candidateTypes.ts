import type { ApiQueryError, AxiosBaseQueryArgs } from "../../../types/apiTypes";

export type CandidateAxiosBaseQueryArgs = AxiosBaseQueryArgs;

export type CandidateApiQueryError = ApiQueryError;

export type CandidateResumeResponse = {
  resumeUrl: string;
  resumePublicId: string;
};
