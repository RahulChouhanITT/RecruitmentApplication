import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  ApplicationStatus,
  ApplicationsQueryParams,
  CandidateInterview,
  CreateJobPayload,
  HrInterview,
  HrJobApplication,
  InterviewFeedback,
  InterviewTimeSlot,
  InterviewsQueryParams,
  InterviewerInterview,
  Job,
  JobApplication,
  JobsQueryParams,
  UpdateJobPayload,
} from '../types/jobTypes';
import { JOBS_API_ROUTES } from '../constants/jobConstants';
import { JOBS_DEFAULT_MESSAGES } from '../labels/jobLabels';
import { createAxiosBaseQuery } from '../../../utils/api/axiosBaseQuery';
import type { ApiQueryError, ApiResponse } from '../../../types/apiTypes';

const axiosBaseQuery = createAxiosBaseQuery(JOBS_DEFAULT_MESSAGES.API_REQUEST_FAILED);

const buildPaginationParams = <T extends Record<string, unknown>>(params?: T | void) => {
  if (!params) {
    return undefined;
  }

  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== '',
  );

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
};

export const jobsApi = createApi({
  reducerPath: 'jobsApi',
  baseQuery: fakeBaseQuery<ApiQueryError>(),
  tagTypes: ['Jobs', 'AppliedJobs', 'JobApplications', 'Interviews', 'Feedback'],
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: false,
  endpoints: (builder) => ({
    getHrJobs: builder.query<ApiResponse<Job[]>, JobsQueryParams | void>({
      queryFn: (query) =>
        axiosBaseQuery<ApiResponse<Job[]>>({
          url: JOBS_API_ROUTES.HR_JOBS,
          method: 'GET',
          params: buildPaginationParams({
            search: query?.search,
            isActive:
              typeof query?.isActive === 'boolean' ? String(query.isActive) : undefined,
            page: query?.page,
            limit: query?.limit,
          }),
        }),
      providesTags: (result) => [
        { type: 'Jobs', id: 'HR_LIST' },
        ...(result?.data ?? []).map((job) => ({ type: 'Jobs' as const, id: job._id })),
      ],
    }),
    getCandidateJobs: builder.query<ApiResponse<Job[]>, JobsQueryParams | void>({
      queryFn: (query) =>
        axiosBaseQuery<ApiResponse<Job[]>>({
          url: JOBS_API_ROUTES.CANDIDATE_JOBS,
          method: 'GET',
          params: buildPaginationParams({
            search: query?.search,
            isActive:
              typeof query?.isActive === 'boolean' ? String(query.isActive) : undefined,
            page: query?.page,
            limit: query?.limit,
          }),
        }),
      providesTags: (result) => [
        { type: 'Jobs', id: 'CANDIDATE_LIST' },
        ...(result?.data ?? []).map((job) => ({ type: 'Jobs' as const, id: job._id })),
      ],
    }),
    createJob: builder.mutation<ApiResponse<Job>, CreateJobPayload>({
      queryFn: (payload) =>
        axiosBaseQuery<ApiResponse<Job>>({
          url: JOBS_API_ROUTES.JOBS,
          method: 'POST',
          data: payload,
        }),
      invalidatesTags: [
        { type: 'Jobs', id: 'HR_LIST' },
        { type: 'Jobs', id: 'CANDIDATE_LIST' },
      ],
    }),
    updateJob: builder.mutation<ApiResponse<Job>, { jobId: string; payload: UpdateJobPayload }>(
      {
        queryFn: ({ jobId, payload }) =>
          axiosBaseQuery<ApiResponse<Job>>({
            url: `/api/jobs/${jobId}`,
            method: 'PUT',
            data: payload,
          }),
        invalidatesTags: (_result, _error, { jobId }) => [
          { type: 'Jobs', id: jobId },
          { type: 'Jobs', id: 'HR_LIST' },
          { type: 'Jobs', id: 'CANDIDATE_LIST' },
        ],
      },
    ),
    closeJob: builder.mutation<ApiResponse<Job>, { jobId: string }>({
      queryFn: ({ jobId }) =>
        axiosBaseQuery<ApiResponse<Job>>({
          url: `/api/jobs/${jobId}/close`,
          method: 'PATCH',
        }),
      invalidatesTags: (_result, _error, { jobId }) => [
        { type: 'Jobs', id: jobId },
        { type: 'Jobs', id: 'HR_LIST' },
        { type: 'Jobs', id: 'CANDIDATE_LIST' },
      ],
    }),
    activateJob: builder.mutation<ApiResponse<Job>, { jobId: string }>({
      queryFn: ({ jobId }) =>
        axiosBaseQuery<ApiResponse<Job>>({
          url: `/api/jobs/${jobId}/activate`,
          method: 'PATCH',
        }),
      invalidatesTags: (_result, _error, { jobId }) => [
        { type: 'Jobs', id: jobId },
        { type: 'Jobs', id: 'HR_LIST' },
        { type: 'Jobs', id: 'CANDIDATE_LIST' },
      ],
    }),
    applyForJob: builder.mutation<ApiResponse<JobApplication>, { jobId: string }>({
      queryFn: ({ jobId }) =>
        axiosBaseQuery<ApiResponse<JobApplication>>({
          url: `/api/jobs/${jobId}/apply`,
          method: 'POST',
        }),
      invalidatesTags: (_result, _error, { jobId }) => [
        { type: 'AppliedJobs', id: 'LIST' },
        { type: 'Jobs', id: jobId },
      ],
    }),
    getAppliedJobs: builder.query<ApiResponse<JobApplication[]>, ApplicationsQueryParams | void>({
      queryFn: (query) =>
        axiosBaseQuery<ApiResponse<JobApplication[]>>({
          url: '/api/jobs/applied/me',
          method: 'GET',
          params: buildPaginationParams(query),
        }),
      providesTags: (result) => [
        { type: 'AppliedJobs', id: 'LIST' },
        ...(result?.data ?? []).map((application) => ({
          type: 'AppliedJobs' as const,
          id: application._id,
        })),
      ],
    }),
    getJobApplications: builder.query<
      ApiResponse<HrJobApplication[]>,
      { jobId: string } & ApplicationsQueryParams
    >({
      queryFn: ({ jobId, ...query }) =>
        axiosBaseQuery<ApiResponse<HrJobApplication[]>>({
          url: `/api/jobs/${jobId}/applications`,
          method: 'GET',
          params: buildPaginationParams(query),
        }),
      providesTags: (_result, _error, { jobId }) => [{ type: 'JobApplications', id: jobId }],
    }),
    updateApplicationStatus: builder.mutation<
      ApiResponse<JobApplication>,
      { applicationId: string; status: ApplicationStatus }
    >({
      queryFn: ({ applicationId, status }) =>
        axiosBaseQuery<ApiResponse<JobApplication>>({
          url: `/api/applications/${applicationId}/status`,
          method: 'PATCH',
          data: { newApplicationStatus: status },
        }),
      invalidatesTags: [
        { type: 'JobApplications' },
        { type: 'Interviews', id: 'HR_LIST' },
        { type: 'Interviews', id: 'CANDIDATE_LIST' },
        { type: 'Interviews', id: 'INTERVIEWER_LIST' },
      ],
    }),
    scheduleInterview: builder.mutation<
      ApiResponse<HrInterview>,
      {
        applicationId: string;
        payload: {
          interviewDate: string;
          interviewTime: string;
          interviewerId: string;
          notes?: string;
        };
      }
    >({
      queryFn: ({ applicationId, payload }) =>
        axiosBaseQuery<ApiResponse<HrInterview>>({
          url: JOBS_API_ROUTES.INTERVIEW_SCHEDULE,
          method: 'POST',
          data: { applicationId, ...payload },
        }),
      invalidatesTags: [
        { type: 'JobApplications' },
        { type: 'Interviews', id: 'HR_LIST' },
        { type: 'Interviews', id: 'CANDIDATE_LIST' },
        { type: 'Interviews', id: 'INTERVIEWER_LIST' },
      ],
    }),
    cancelInterview: builder.mutation<ApiResponse<HrInterview>, { interviewId: string }>({
      queryFn: ({ interviewId }) =>
        axiosBaseQuery<ApiResponse<HrInterview>>({
          url: `${JOBS_API_ROUTES.INTERVIEW_CANCEL}/${interviewId}/cancel`,
          method: 'PATCH',
        }),
      invalidatesTags: [{ type: 'JobApplications' }, { type: 'Interviews', id: 'HR_LIST' }],
    }),
    getInterviewerAvailability: builder.query<
      ApiResponse<InterviewTimeSlot[]>,
      { interviewerId: string; date: string }
    >({
      queryFn: ({ interviewerId, date }) =>
        axiosBaseQuery<ApiResponse<InterviewTimeSlot[]>>({
          url: `/api/interviews/availability?interviewerId=${encodeURIComponent(interviewerId)}&date=${encodeURIComponent(date)}`,
          method: 'GET',
        }),
    }),
    getHrInterviews: builder.query<ApiResponse<HrInterview[]>, InterviewsQueryParams | void>({
      queryFn: (query) =>
        axiosBaseQuery<ApiResponse<HrInterview[]>>({
          url: JOBS_API_ROUTES.HR_INTERVIEWS,
          method: 'GET',
          params: buildPaginationParams(query),
        }),
      providesTags: [{ type: 'Interviews', id: 'HR_LIST' }],
    }),
    getCandidateInterviews: builder.query<
      ApiResponse<CandidateInterview[]>,
      InterviewsQueryParams | void
    >({
      queryFn: (query) =>
        axiosBaseQuery<ApiResponse<CandidateInterview[]>>({
          url: JOBS_API_ROUTES.CANDIDATE_INTERVIEWS,
          method: 'GET',
          params: buildPaginationParams(query),
        }),
      providesTags: [{ type: 'Interviews', id: 'CANDIDATE_LIST' }],
    }),
    getInterviewerInterviews: builder.query<
      ApiResponse<InterviewerInterview[]>,
      InterviewsQueryParams | void
    >({
      queryFn: (query) =>
        axiosBaseQuery<ApiResponse<InterviewerInterview[]>>({
          url: JOBS_API_ROUTES.INTERVIEWER_INTERVIEWS,
          method: 'GET',
          params: buildPaginationParams(query),
        }),
      providesTags: [{ type: 'Interviews', id: 'INTERVIEWER_LIST' }],
    }),
    submitInterviewFeedback: builder.mutation<
      ApiResponse<InterviewFeedback>,
      {
        interviewId: string;
        rating: number;
        comments?: string;
        recommendation: 'HIRED' | 'REJECTED';
      }
    >({
      queryFn: (payload) =>
        axiosBaseQuery<ApiResponse<InterviewFeedback>>({
          url: '/api/feedback',
          method: 'POST',
          data: payload,
        }),
      invalidatesTags: [
        { type: 'Interviews', id: 'INTERVIEWER_LIST' },
        { type: 'Interviews', id: 'HR_LIST' },
        { type: 'Feedback' },
      ],
    }),
    getHrInterviewFeedback: builder.query<
      ApiResponse<InterviewFeedback>,
      { interviewId: string }
    >({
      queryFn: ({ interviewId }) =>
        axiosBaseQuery<ApiResponse<InterviewFeedback>>({
          url: `/api/feedback/interview/${interviewId}`,
          method: 'GET',
        }),
      providesTags: (_result, _error, { interviewId }) => [{ type: 'Feedback', id: interviewId }],
    }),
  }),
});

export const {
  useGetHrJobsQuery,
  useGetCandidateJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useCloseJobMutation,
  useActivateJobMutation,
  useApplyForJobMutation,
  useGetAppliedJobsQuery,
  useGetJobApplicationsQuery,
  useGetHrInterviewsQuery,
  useGetCandidateInterviewsQuery,
  useGetInterviewerInterviewsQuery,
  useGetHrInterviewFeedbackQuery,
  useGetInterviewerAvailabilityQuery,
  useCancelInterviewMutation,
  useScheduleInterviewMutation,
  useSubmitInterviewFeedbackMutation,
  useUpdateApplicationStatusMutation,
} = jobsApi;
