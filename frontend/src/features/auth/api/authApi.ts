import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { AUTH_API_ROUTES } from '../constants/authConstants';
import { AUTH_DEFAULT_MESSAGES } from '../labels/authLabels';
import type { ApiQueryError, ApiResponse } from '../../../types/apiTypes';
import type { AuthUser, LoginPayload, RegisterPayload, ResendOtpPayload, VerifyEmailPayload } from '../types/authTypes';
import { createAxiosBaseQuery } from '../../../utils/api/axiosBaseQuery';

const axiosBaseQuery = createAxiosBaseQuery(AUTH_DEFAULT_MESSAGES.API_REQUEST_FAILED);

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fakeBaseQuery<ApiQueryError>(),
  tagTypes: ['CurrentUser'],
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: false,
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthUser>, LoginPayload>({
      queryFn: (payload) =>
        axiosBaseQuery<ApiResponse<AuthUser>>({
          url: AUTH_API_ROUTES.LOGIN,
          method: 'POST',
          data: payload,
        }),
    }),
    registerUser: builder.mutation<ApiResponse<AuthUser>, RegisterPayload>({
      queryFn: (payload) =>
        axiosBaseQuery<ApiResponse<AuthUser>>({
          url: AUTH_API_ROUTES.REGISTER,
          method: 'POST',
          data: {
            name: payload.fullName,
            email: payload.email,
            password: payload.password,
            role: payload.role,
          },
        }),
    }),
    verifyEmail: builder.mutation<ApiResponse<AuthUser>, VerifyEmailPayload>({
      queryFn: (payload) =>
        axiosBaseQuery<ApiResponse<AuthUser>>({
          url: AUTH_API_ROUTES.VERIFY_EMAIL,
          method: 'POST',
          data: payload,
        }),
    }),
    resendOtp: builder.mutation<ApiResponse, ResendOtpPayload>({
      queryFn: (payload) =>
        axiosBaseQuery<ApiResponse>({
          url: AUTH_API_ROUTES.RESEND_OTP,
          method: 'POST',
          data: payload,
        }),
    }),
    logout: builder.mutation<ApiResponse, void>({
      queryFn: () =>
        axiosBaseQuery<ApiResponse>({
          url: AUTH_API_ROUTES.LOGOUT,
          method: 'POST',
        }),
      invalidatesTags: [{ type: 'CurrentUser', id: 'ME' }],
    }),
    getCurrentUser: builder.query<ApiResponse<AuthUser>, void>({
      queryFn: () =>
        axiosBaseQuery<ApiResponse<AuthUser>>({
          url: AUTH_API_ROUTES.CURRENT_USER,
          method: 'GET',
        }),
      providesTags: [{ type: 'CurrentUser', id: 'ME' }],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterUserMutation,
  useVerifyEmailMutation,
  useResendOtpMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
} = authApi;
