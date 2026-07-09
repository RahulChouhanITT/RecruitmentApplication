import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { createAxiosBaseQuery } from '../../../utils/api/axiosBaseQuery';
import type { ApiQueryError } from '../../../types/apiTypes';
import type {
  NotificationApiResponse,
  NotificationItem,
  NotificationUnreadCount,
} from '../../../types/notificationTypes';

const axiosBaseQuery = createAxiosBaseQuery('Notification request failed');

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fakeBaseQuery<ApiQueryError>(),
  tagTypes: ['Notifications'],
  keepUnusedDataFor: 120,
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationApiResponse<NotificationItem[]>, void>({
      queryFn: () =>
        axiosBaseQuery<NotificationApiResponse<NotificationItem[]>>({
          url: '/api/notifications',
          method: 'GET',
        }),
      providesTags: (result) => [
        { type: 'Notifications', id: 'LIST' },
        ...((result?.data ?? []).map((notification) => ({
          type: 'Notifications' as const,
          id: notification._id,
        })) ?? []),
      ],
    }),
    markAsRead: builder.mutation<NotificationApiResponse<NotificationItem>, { notificationId: string }>({
      queryFn: ({ notificationId }) =>
        axiosBaseQuery<NotificationApiResponse<NotificationItem>>({
          url: `/api/notifications/${notificationId}/read`,
          method: 'PATCH',
        }),
      async onQueryStarted({ notificationId }, { dispatch, queryFulfilled }) {
        const notificationsPatch = dispatch(
          notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            const notifications = draft.data ?? [];
            const target = notifications.find((notification) => notification._id === notificationId);
            if (target) {
              target.isRead = true;
            }
          }),
        );

        const unreadCountPatch = dispatch(
          notificationApi.util.updateQueryData('getUnreadCount', undefined, (draft) => {
            const currentCount = draft.data?.count ?? 0;
            draft.data = { count: Math.max(0, currentCount - 1) };
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          notificationsPatch.undo();
          unreadCountPatch.undo();
        }
      },
    }),
    markAllAsRead: builder.mutation<NotificationApiResponse, void>({
      queryFn: () =>
        axiosBaseQuery<NotificationApiResponse>({
          url: '/api/notifications/read-all',
          method: 'PATCH',
        }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const notificationsPatch = dispatch(
          notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            const notifications = draft.data ?? [];
            notifications.forEach((notification) => {
              notification.isRead = true;
            });
          }),
        );

        const unreadCountPatch = dispatch(
          notificationApi.util.updateQueryData('getUnreadCount', undefined, (draft) => {
            draft.data = { count: 0 };
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          notificationsPatch.undo();
          unreadCountPatch.undo();
        }
      },
    }),
    getUnreadCount: builder.query<NotificationApiResponse<NotificationUnreadCount>, void>({
      queryFn: () =>
        axiosBaseQuery<NotificationApiResponse<NotificationUnreadCount>>({
          url: '/api/notifications/unread-count',
          method: 'GET',
        }),
      providesTags: [{ type: 'Notifications', id: 'UNREAD_COUNT' }],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} = notificationApi;
