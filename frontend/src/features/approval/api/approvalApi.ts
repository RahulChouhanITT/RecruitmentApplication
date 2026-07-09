import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiQueryError, ApiResponse } from '../../../types/apiTypes';
import { createAxiosBaseQuery } from '../../../utils/api/axiosBaseQuery';
import { AUTH_DEFAULT_MESSAGES } from '../../auth/labels/authLabels';
import { APPROVAL_API_ROUTES } from '../constants/approvalApiConstants';
import type { PendingApprovalUser } from '../types';

const axiosBaseQuery = createAxiosBaseQuery(AUTH_DEFAULT_MESSAGES.API_REQUEST_FAILED);

export const approvalApi = createApi({
  reducerPath: 'approvalApi',
  baseQuery: fakeBaseQuery<ApiQueryError>(),
  tagTypes: ['PendingApprovals'],
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: false,
  endpoints: (builder) => ({
    getPendingApprovals: builder.query<ApiResponse<PendingApprovalUser[]>, void>({
      queryFn: () =>
        axiosBaseQuery<ApiResponse<PendingApprovalUser[]>>({
          url: APPROVAL_API_ROUTES.PENDING_APPROVALS,
          method: 'GET',
        }),
      providesTags: (result) => [
        { type: 'PendingApprovals', id: 'LIST' },
        ...(result?.data ?? []).map((user) => ({
          type: 'PendingApprovals' as const,
          id: user._id,
        })),
      ],
    }),
    updateApprovalStatus: builder.mutation<
      ApiResponse<PendingApprovalUser>,
      { userId: string; isApproved: boolean }
    >({
      queryFn: ({ userId, isApproved }) =>
        axiosBaseQuery<ApiResponse<PendingApprovalUser>>({
          url: `${APPROVAL_API_ROUTES.APPROVALS}/${userId}`,
          method: 'PUT',
          data: { isApproved },
        }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'PendingApprovals', id: 'LIST' },
        { type: 'PendingApprovals', id: userId },
      ],
    }),
  }),
});

export const { useGetPendingApprovalsQuery, useUpdateApprovalStatusMutation } = approvalApi;
