import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { CANDIDATE_API_DEFAULTS, CANDIDATE_API_ROUTES } from "../constants/candidateConstants";
import { CANDIDATE_DEFAULT_MESSAGES } from "../labels/candidateLabels";
import type { CandidateApiQueryError, CandidateResumeResponse } from "../types/candidateTypes";
import type { AuthApiResponse } from "../../auth/types/authTypes";
import { createAxiosBaseQuery } from "../../../utils/api/axiosBaseQuery";

const axiosBaseQuery = createAxiosBaseQuery<AuthApiResponse>(CANDIDATE_DEFAULT_MESSAGES.API_REQUEST_FAILED);

export const candidateApi = createApi({
  reducerPath: "candidateApi",
  baseQuery: fakeBaseQuery<CandidateApiQueryError>(),
  endpoints: (builder) => ({
    uploadResume: builder.mutation<AuthApiResponse<CandidateResumeResponse>, { file: File }>({
      queryFn: ({ file }) => {
        const formData = new FormData();
        formData.append(CANDIDATE_API_DEFAULTS.RESUME_FORM_FIELD, file);

        return axiosBaseQuery<CandidateResumeResponse>({
          url: CANDIDATE_API_ROUTES.RESUME,
          method: "POST",
          data: formData,
          headers: { "Content-Type": CANDIDATE_API_DEFAULTS.MULTIPART_CONTENT_TYPE },
        });
      },
    }),
    deleteResume: builder.mutation<AuthApiResponse<CandidateResumeResponse>, void>({
      queryFn: () =>
        axiosBaseQuery<CandidateResumeResponse>({
          url: CANDIDATE_API_ROUTES.RESUME,
          method: "DELETE",
        }),
    }),
  }),
});

export const { useUploadResumeMutation, useDeleteResumeMutation } = candidateApi;
