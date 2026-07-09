import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiQueryError, ApiResponse } from '../../../types/apiTypes';
import { createAxiosBaseQuery } from '../../../utils/api/axiosBaseQuery';
import { PROFILE_DEFAULT_MESSAGES } from '../labels/profileLabels';
import { PROFILE_API_ROUTES } from '../constants/profileApiConstants';
import type { CompleteProfilePayload, UpdateProfilePayload, UserProfile } from '../types';
import type { AuthUser } from '../../auth/types';

const axiosBaseQuery = createAxiosBaseQuery(PROFILE_DEFAULT_MESSAGES.PROFILE_LOAD_FAILED);

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: fakeBaseQuery<ApiQueryError>(),
  tagTypes: ['Profile'],
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: false,
  endpoints: (builder) => ({
    completeProfile: builder.mutation<ApiResponse<AuthUser>, CompleteProfilePayload>({
      queryFn: (payload) =>
        axiosBaseQuery<ApiResponse<AuthUser>>({
          url: PROFILE_API_ROUTES.COMPLETE_PROFILE,
          method: 'PUT',
          data: payload,
        }),
      async onQueryStarted(payload, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            profileApi.util.updateQueryData('getProfile', undefined, (draft) => {
              if (!draft.data) {
                return;
              }

              draft.data = {
                ...draft.data,
                ...payload,
                ...(data.data ?? {}),
              };
            }),
          );
        } catch {
          return;
        }
      },
      invalidatesTags: [{ type: 'Profile', id: 'ME' }],
    }),
    getProfile: builder.query<ApiResponse<UserProfile>, void>({
      queryFn: () =>
        axiosBaseQuery<ApiResponse<UserProfile>>({
          url: PROFILE_API_ROUTES.PROFILE,
          method: 'GET',
        }),
      providesTags: [{ type: 'Profile', id: 'ME' }],
    }),
    updateProfile: builder.mutation<ApiResponse<AuthUser>, UpdateProfilePayload>({
      queryFn: (payload) =>
        axiosBaseQuery<ApiResponse<AuthUser>>({
          url: PROFILE_API_ROUTES.PROFILE,
          method: 'PUT',
          data: payload,
        }),
      async onQueryStarted(payload, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            profileApi.util.updateQueryData('getProfile', undefined, (draft) => {
              if (!draft.data) {
                return;
              }

              draft.data = {
                ...draft.data,
                ...payload,
                ...(data.data ?? {}),
              };
            }),
          );
        } catch {
          return;
        }
      },
      invalidatesTags: [{ type: 'Profile', id: 'ME' }],
    }),
  }),
});

export const { useCompleteProfileMutation, useGetProfileQuery, useUpdateProfileMutation } =
  profileApi;
