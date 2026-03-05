import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import axios from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";
import type {
  AuthApiResponse,
  AuthUser,
  CompleteProfilePayload,
  LoginPayload,
  PendingApprovalUser,
  RegisterPayload,
  ResendOtpPayload,
  VerifyEmailPayload,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

type AxiosBaseQueryArgs = {
  url: string;
  method: AxiosRequestConfig["method"];
  data?: unknown;
};

type QueryError = {
  status: number;
  message: string;
};

const axiosBaseQuery = async <T>({ url, method, data }: AxiosBaseQueryArgs) => {
  try {
    const result = await axiosInstance.request<AuthApiResponse<T>>({
      url,
      method,
      data,
    });

    return { data: result.data };
  } catch (axiosError) {
    const error = axiosError as AxiosError<AuthApiResponse>;
    const status = error.response?.status ?? 500;
    const message =
      error.response?.data?.message ?? error.message ?? "Something went wrong while calling API";

    return {
      error: {
        status,
        message,
      } as QueryError,
    };
  }
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fakeBaseQuery<QueryError>(),
  endpoints: (builder) => ({
    login: builder.mutation<AuthApiResponse<AuthUser>, LoginPayload>({
      queryFn: (payload) => axiosBaseQuery<AuthUser>({ url: "/api/auth/login", method: "POST", data: payload }),
    }),
    registerCandidate: builder.mutation<AuthApiResponse<AuthUser>, RegisterPayload>({
      queryFn: (payload) =>
        axiosBaseQuery<AuthUser>({
          url: "/api/auth/register",
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
        axiosBaseQuery<AuthUser>({
          url: "/api/auth/verify-email",
          method: "POST",
          data: payload,
        }),
    }),
    resendOtp: builder.mutation<AuthApiResponse, ResendOtpPayload>({
      queryFn: (payload) =>
        axiosBaseQuery({
          url: "/api/auth/resend-otp",
          method: "POST",
          data: payload,
        }),
    }),
    logout: builder.mutation<AuthApiResponse, void>({
      queryFn: () =>
        axiosBaseQuery({
          url: "/api/auth/logout",
          method: "POST",
        }),
     
    }),
    getCurrentUser: builder.query<AuthApiResponse<AuthUser>, void>({
      queryFn: () => axiosBaseQuery<AuthUser>({ url: "/api/auth/me", method: "GET" }),
    }),
    getPendingApprovals: builder.query<AuthApiResponse<PendingApprovalUser[]>, void>({
      queryFn: () =>
        axiosBaseQuery<PendingApprovalUser[]>({
          url: "/api/auth/pending-approvals",
          method: "GET",
        }),
    }),
    updateApprovalStatus: builder.mutation<
      AuthApiResponse<PendingApprovalUser>,
      { userId: string; isApproved: boolean }
    >({
      queryFn: ({ userId, isApproved }) =>
        axiosBaseQuery<PendingApprovalUser>({
          url: `/api/auth/approvals/${userId}`,
          method: "PUT",
          data: { isApproved },
        }),
    }),
    completeProfile: builder.mutation<AuthApiResponse<AuthUser>, CompleteProfilePayload>({
      queryFn: (payload) =>
        axiosBaseQuery<AuthUser>({
          url: "/api/auth/profile/complete",
          method: "PUT",
          data: payload,
        }),
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
  useUpdateApprovalStatusMutation,
  useCompleteProfileMutation,
} = authApi;
