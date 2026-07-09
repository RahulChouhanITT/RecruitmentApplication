import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiQueryError, ApiResponse } from '../../../types/apiTypes';
import { createAxiosBaseQuery } from '../../../utils/api/axiosBaseQuery';
import { PROFILE_API_ROUTES } from '../constants/profileApiConstants';
import { PROFILE_DEFAULT_MESSAGES } from '../labels/profileLabels';
import type { ResumeUploadResponse } from '../types/profileTypes';

const axiosBaseQuery = createAxiosBaseQuery(PROFILE_DEFAULT_MESSAGES.RESUME_UPLOAD_FAILED);

export const resumeApi = createApi({
  reducerPath: 'resumeApi',
  baseQuery: fakeBaseQuery<ApiQueryError>(),
  endpoints: (builder) => ({
    uploadResume: builder.mutation<ApiResponse<ResumeUploadResponse>, { file: File }>({
      queryFn: ({ file }) => {
        const formData = new FormData();
        formData.append('resume', file);

        return axiosBaseQuery<ApiResponse<ResumeUploadResponse>>({
          url: PROFILE_API_ROUTES.RESUME,
          method: 'POST',
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      },
    }),
    deleteResume: builder.mutation<ApiResponse, void>({
      queryFn: () =>
        axiosBaseQuery<ApiResponse>({
          url: PROFILE_API_ROUTES.RESUME,
          method: 'DELETE',
        }),
    }),
  }),
});

export const { useUploadResumeMutation, useDeleteResumeMutation } = resumeApi;
