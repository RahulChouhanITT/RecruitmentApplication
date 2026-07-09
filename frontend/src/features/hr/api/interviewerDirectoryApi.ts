import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiQueryError, ApiResponse } from '../../../types/apiTypes';
import { createAxiosBaseQuery } from '../../../utils/api/axiosBaseQuery';
import { HR_API_ROUTES } from '../constants/hrApiConstants';
import { HR_INTERVIEW_DEFAULT_MESSAGES } from '../labels/hrLabels';
import type { InterviewerOption } from '../types/hrTypes';

const axiosBaseQuery = createAxiosBaseQuery(HR_INTERVIEW_DEFAULT_MESSAGES.API_REQUEST_FAILED);

export type InterviewerDirectoryQueryParams = {
  page: number;
  limit: number;
};

const INTERVIEWER_DIRECTORY_DEFAULT_QUERY: InterviewerDirectoryQueryParams = {
  page: 1,
  limit: 100,
};

export const interviewerDirectoryApi = createApi({
  reducerPath: 'interviewerDirectoryApi',
  baseQuery: fakeBaseQuery<ApiQueryError>(),
  tagTypes: ['Interviewers'],
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: false,
  endpoints: (builder) => ({
    getInterviewers: builder.query<
      ApiResponse<InterviewerOption[]>,
      InterviewerDirectoryQueryParams | void
    >({
      queryFn: (query) => {
        const { page, limit } = query ?? INTERVIEWER_DIRECTORY_DEFAULT_QUERY;

        return axiosBaseQuery<ApiResponse<InterviewerOption[]>>({
          url: HR_API_ROUTES.INTERVIEWERS,
          method: 'GET',
          params: { page, limit },
        });
      },
      providesTags: [{ type: 'Interviewers', id: 'LIST' }],
    }),
  }),
});

export const { useGetInterviewersQuery } = interviewerDirectoryApi;
