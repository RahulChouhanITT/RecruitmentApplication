import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ApplicationStatus,
  CandidateInterview,
  CreateJobPayload,
  HrInterview,
  HrJobApplication,
  InterviewFeedback,
  InterviewTimeSlot,
  InterviewerInterview,
  Job,
  JobApplication,
  UpdateJobPayload,
} from "../types/jobTypes";
import type {
  AuthApiResponse,
} from "../../auth/types/authTypes";
import { JOBS_API_ROUTES } from "../constants/jobConstants";
import { JOBS_DEFAULT_MESSAGES } from "../labels/jobLabels";
import { createAxiosBaseQuery } from "../../../utils/api/axiosBaseQuery";
import type { ApiQueryError } from "../../../types/apiTypes";

const axiosBaseQuery = createAxiosBaseQuery<AuthApiResponse>(JOBS_DEFAULT_MESSAGES.API_REQUEST_FAILED);

export const jobsApi = createApi({
  reducerPath: "jobsApi",
  baseQuery: fakeBaseQuery<ApiQueryError>(),
  tagTypes: ["Jobs", "AppliedJobs", "JobApplications", "Interviews", "Feedback"],
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: false,
  endpoints: (builder) => ({
    getHrJobs: builder.query<AuthApiResponse<Job[]>, void>({
      queryFn: () => axiosBaseQuery<Job[]>({ url: JOBS_API_ROUTES.HR_JOBS, method: "GET" }),
      providesTags: (result) => [
        { type: "Jobs", id: "HR_LIST" },
        ...(result?.data ?? []).map((job) => ({ type: "Jobs" as const, id: job._id })),
      ],
    }),
    getCandidateJobs: builder.query<AuthApiResponse<Job[]>, void>({
      queryFn: () => axiosBaseQuery<Job[]>({ url: JOBS_API_ROUTES.CANDIDATE_JOBS, method: "GET" }),
      providesTags: (result) => [
        { type: "Jobs", id: "CANDIDATE_LIST" },
        ...(result?.data ?? []).map((job) => ({ type: "Jobs" as const, id: job._id })),
      ],
    }),
    createJob: builder.mutation<AuthApiResponse<Job>, CreateJobPayload>({
      queryFn: (payload) => axiosBaseQuery<Job>({ url: JOBS_API_ROUTES.JOBS, method: "POST", data: payload }),
      invalidatesTags: [{ type: "Jobs", id: "HR_LIST" }, { type: "Jobs", id: "CANDIDATE_LIST" }],
    }),
    updateJob: builder.mutation<AuthApiResponse<Job>, { jobId: string; payload: UpdateJobPayload }>({
      queryFn: ({ jobId, payload }) =>
        axiosBaseQuery<Job>({
          url: `/api/jobs/${jobId}`,
          method: "PUT",
          data: payload,
        }),
      invalidatesTags: (_result, _error, { jobId }) => [
        { type: "Jobs", id: jobId },
        { type: "Jobs", id: "HR_LIST" },
        { type: "Jobs", id: "CANDIDATE_LIST" },
      ],
    }),
    closeJob: builder.mutation<AuthApiResponse<Job>, { jobId: string }>({
      queryFn: ({ jobId }) =>
        axiosBaseQuery<Job>({
          url: `/api/jobs/${jobId}/close`,
          method: "PATCH",
        }),
      invalidatesTags: (_result, _error, { jobId }) => [
        { type: "Jobs", id: jobId },
        { type: "Jobs", id: "HR_LIST" },
        { type: "Jobs", id: "CANDIDATE_LIST" },
      ],
    }),
    activateJob: builder.mutation<AuthApiResponse<Job>, { jobId: string }>({
      queryFn: ({ jobId }) =>
        axiosBaseQuery<Job>({
          url: `/api/jobs/${jobId}/activate`,
          method: "PATCH",
        }),
      invalidatesTags: (_result, _error, { jobId }) => [
        { type: "Jobs", id: jobId },
        { type: "Jobs", id: "HR_LIST" },
        { type: "Jobs", id: "CANDIDATE_LIST" },
      ],
    }),
    applyForJob: builder.mutation<AuthApiResponse<JobApplication>, { jobId: string }>({
      queryFn: ({ jobId }) =>
        axiosBaseQuery<JobApplication>({
          url: `/api/jobs/${jobId}/apply`,
          method: "POST",
        }),
      invalidatesTags: (_result, _error, { jobId }) => [
        { type: "AppliedJobs", id: "LIST" },
        { type: "Jobs", id: jobId },
      ],
    }),
    getAppliedJobs: builder.query<AuthApiResponse<JobApplication[]>, void>({
      queryFn: () =>
        axiosBaseQuery<JobApplication[]>({
          url: "/api/jobs/applied/me",
          method: "GET",
        }),
      providesTags: (result) => [
        { type: "AppliedJobs", id: "LIST" },
        ...(result?.data ?? []).map((application) => ({ type: "AppliedJobs" as const, id: application._id })),
      ],
    }),
    getJobApplications: builder.query<AuthApiResponse<HrJobApplication[]>, { jobId: string }>({
      queryFn: ({ jobId }) =>
        axiosBaseQuery<HrJobApplication[]>({
          url: `/api/jobs/${jobId}/applications`,
          method: "GET",
        }),
      providesTags: (_result, _error, { jobId }) => [{ type: "JobApplications", id: jobId }],
    }),
    updateApplicationStatus: builder.mutation<
      AuthApiResponse<JobApplication>,
      { applicationId: string; status: ApplicationStatus }
    >({
      queryFn: ({ applicationId, status }) =>
        axiosBaseQuery<JobApplication>({
          url: `/api/applications/${applicationId}/status`,
          method: "PATCH",
          data: { status },
        }),
      invalidatesTags: [{ type: "JobApplications" }, { type: "Interviews", id: "HR_LIST" }],
    }),
    scheduleInterview: builder.mutation<
      AuthApiResponse<HrInterview>,
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
        axiosBaseQuery<HrInterview>({
          url: JOBS_API_ROUTES.INTERVIEW_SCHEDULE,
          method: "POST",
          data: { applicationId, ...payload },
        }),
      invalidatesTags: [{ type: "JobApplications" }, { type: "Interviews", id: "HR_LIST" }],
    }),
    cancelInterview: builder.mutation<AuthApiResponse<HrInterview>, { interviewId: string }>({
      queryFn: ({ interviewId }) =>
        axiosBaseQuery<HrInterview>({
          url: `${JOBS_API_ROUTES.INTERVIEW_CANCEL}/${interviewId}/cancel`,
          method: "PATCH",
        }),
      invalidatesTags: [{ type: "JobApplications" }, { type: "Interviews", id: "HR_LIST" }],
    }),
    getInterviewerAvailability: builder.query<
      AuthApiResponse<InterviewTimeSlot[]>,
      { interviewerId: string; date: string }
    >({
      queryFn: ({ interviewerId, date }) =>
        axiosBaseQuery<InterviewTimeSlot[]>({
          url: `/api/interviews/availability?interviewerId=${encodeURIComponent(interviewerId)}&date=${encodeURIComponent(date)}`,
          method: "GET",
        }),
    }),
    getHrInterviews: builder.query<AuthApiResponse<HrInterview[]>, void>({
      queryFn: () =>
        axiosBaseQuery<HrInterview[]>({
          url: JOBS_API_ROUTES.HR_INTERVIEWS,
          method: "GET",
        }),
      providesTags: [{ type: "Interviews", id: "HR_LIST" }],
    }),
    getCandidateInterviews: builder.query<AuthApiResponse<CandidateInterview[]>, void>({
      queryFn: () =>
        axiosBaseQuery<CandidateInterview[]>({
          url: JOBS_API_ROUTES.CANDIDATE_INTERVIEWS,
          method: "GET",
        }),
      providesTags: [{ type: "Interviews", id: "CANDIDATE_LIST" }],
    }),
    getInterviewerInterviews: builder.query<AuthApiResponse<InterviewerInterview[]>, void>({
      queryFn: () =>
        axiosBaseQuery<InterviewerInterview[]>({
          url: JOBS_API_ROUTES.INTERVIEWER_INTERVIEWS,
          method: "GET",
        }),
      providesTags: [{ type: "Interviews", id: "INTERVIEWER_LIST" }],
    }),
    submitInterviewFeedback: builder.mutation<
      AuthApiResponse<InterviewFeedback>,
      { interviewId: string; rating: number; comments?: string; recommendation: "HIRED" | "REJECTED" }
    >({
      queryFn: (payload) =>
        axiosBaseQuery<InterviewFeedback>({
          url: "/api/feedback",
          method: "POST",
          data: payload,
        }),
      invalidatesTags: [{ type: "Interviews", id: "INTERVIEWER_LIST" }, { type: "Interviews", id: "HR_LIST" }, { type: "Feedback" }],
    }),
    getHrInterviewFeedback: builder.query<AuthApiResponse<InterviewFeedback>, { interviewId: string }>({
      queryFn: ({ interviewId }) =>
        axiosBaseQuery<InterviewFeedback>({
          url: `/api/feedback/interview/${interviewId}`,
          method: "GET",
        }),
      providesTags: (_result, _error, { interviewId }) => [{ type: "Feedback", id: interviewId }],
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
