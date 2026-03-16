import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { AUTH_API_ROUTES } from "../constants/authConstants";
import { AUTH_DEFAULT_MESSAGES } from "../labels/authLabels";
import type {
  AuthApiQueryError,
  AuthApiResponse,
  AuthUser,
  CompleteProfilePayload,
  InterviewerOption,
  LoginPayload,
  PendingApprovalUser,
  RegisterPayload,
  ResendOtpPayload,
  UpdateProfilePayload,
  UserProfile,
  VerifyEmailPayload,
} from "../types/authTypes";
import { createAxiosBaseQuery } from "../../../utils/api/axiosBaseQuery";

const axiosBaseQuery = createAxiosBaseQuery(AUTH_DEFAULT_MESSAGES.API_REQUEST_FAILED);

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fakeBaseQuery<AuthApiQueryError>(),
  tagTypes: ["CurrentUser", "PendingApprovals", "Interviewers"],
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: false,
  endpoints: (builder) => ({
    login: builder.mutation<AuthApiResponse<AuthUser>, LoginPayload>({
      queryFn: (payload) =>
        axiosBaseQuery<AuthApiResponse<AuthUser>>({ url: AUTH_API_ROUTES.LOGIN, method: "POST", data: payload }),
    }),
    registerCandidate: builder.mutation<AuthApiResponse<AuthUser>, RegisterPayload>({
      queryFn: (payload) =>
        axiosBaseQuery<AuthApiResponse<AuthUser>>({
          url: AUTH_API_ROUTES.REGISTER,
          method: "POST",
          data: {
            name: payload.fullName,
            email: payload.email,
            password: payload.password,
            role: payload.role,
          },
        }),
    }),
    verifyEmail: builder.mutation<AuthApiResponse<AuthUser>, VerifyEmailPayload>({
      queryFn: (payload) =>
        axiosBaseQuery<AuthApiResponse<AuthUser>>({
          url: AUTH_API_ROUTES.VERIFY_EMAIL,
          method: "POST",
          data: payload,
        }),
    }),
    resendOtp: builder.mutation<AuthApiResponse, ResendOtpPayload>({
      queryFn: (payload) =>
        axiosBaseQuery<AuthApiResponse>({
          url: AUTH_API_ROUTES.RESEND_OTP,
          method: "POST",
          data: payload,
        }),
    }),
    logout: builder.mutation<AuthApiResponse, void>({
      queryFn: () =>
        axiosBaseQuery<AuthApiResponse>({
          url: AUTH_API_ROUTES.LOGOUT,
          method: "POST",
        }),
      invalidatesTags: [{ type: "CurrentUser", id: "ME" }],
     
    }),
    getCurrentUser: builder.query<AuthApiResponse<AuthUser>, void>({
      queryFn: () =>
        axiosBaseQuery<AuthApiResponse<AuthUser>>({ url: AUTH_API_ROUTES.CURRENT_USER, method: "GET" }),
      providesTags: [{ type: "CurrentUser", id: "ME" }],
    }),
    getPendingApprovals: builder.query<AuthApiResponse<PendingApprovalUser[]>, void>({
      queryFn: () =>
        axiosBaseQuery<AuthApiResponse<PendingApprovalUser[]>>({
          url: AUTH_API_ROUTES.PENDING_APPROVALS,
          method: "GET",
        }),
      providesTags: (result) => [
        { type: "PendingApprovals", id: "LIST" },
        ...(result?.data ?? []).map((user) => ({ type: "PendingApprovals" as const, id: user._id })),
      ],
    }),
    getInterviewers: builder.query<AuthApiResponse<InterviewerOption[]>, void>({
      queryFn: () =>
        axiosBaseQuery<AuthApiResponse<InterviewerOption[]>>({
          url: AUTH_API_ROUTES.INTERVIEWERS,
          method: "GET",
        }),
      providesTags: [{ type: "Interviewers", id: "LIST" }],
    }),
    updateApprovalStatus: builder.mutation<
      AuthApiResponse<PendingApprovalUser>,
      { userId: string; isApproved: boolean }
    >({
      queryFn: ({ userId, isApproved }) =>
        axiosBaseQuery<AuthApiResponse<PendingApprovalUser>>({
          url: `${AUTH_API_ROUTES.APPROVALS}/${userId}`,
          method: "PUT",
          data: { isApproved },
        }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "PendingApprovals", id: "LIST" },
        { type: "PendingApprovals", id: userId },
      ],
    }),
    completeProfile: builder.mutation<AuthApiResponse<AuthUser>, CompleteProfilePayload>({
      queryFn: (payload) =>
        axiosBaseQuery<AuthApiResponse<AuthUser>>({
          url: AUTH_API_ROUTES.COMPLETE_PROFILE,
          method: "PUT",
          data: payload,
        }),
      invalidatesTags: [{ type: "CurrentUser", id: "ME" }],
    }),
    getProfile: builder.query<AuthApiResponse<UserProfile>, void>({
      queryFn: () =>
        axiosBaseQuery<AuthApiResponse<UserProfile>>({
          url: AUTH_API_ROUTES.PROFILE,
          method: "GET",
        }),
      providesTags: [{ type: "CurrentUser", id: "PROFILE" }],
    }),
    updateProfile: builder.mutation<AuthApiResponse<AuthUser>, UpdateProfilePayload>({
      queryFn: (payload) =>
        axiosBaseQuery<AuthApiResponse<AuthUser>>({
          url: AUTH_API_ROUTES.PROFILE,
          method: "PUT",
          data: payload,
        }),
      invalidatesTags: [
        { type: "CurrentUser", id: "ME" },
        { type: "CurrentUser", id: "PROFILE" },
      ],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterCandidateMutation,
  useVerifyEmailMutation,
  useResendOtpMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useGetPendingApprovalsQuery,
  useGetInterviewersQuery,
  useUpdateApprovalStatusMutation,
  useCompleteProfileMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
