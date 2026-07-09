import { useEffect, useMemo, useState } from 'react';
import { FiBell } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { useSocket } from '../../../../app/socket/useSocket';
import {
  notificationApi,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from '../../api/notificationApi';
import type { NotificationItem } from '../../../../types/notificationTypes';
import {
  NotificationAction,
  NotificationBadge,
  NotificationButton,
  NotificationDropdown,
  NotificationEmpty,
  NotificationHeader,
  NotificationItemRow,
  NotificationList,
  NotificationMessage,
  NotificationRoot,
} from './NotificationBell.styles';

const formatNotificationTime = (value: string): string => {
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toLocaleString();
};

export const NotificationBell = () => {
  const dispatch = useAppDispatch();
  const { socket } = useSocket();
  const currentUserId = useAppSelector((state) => state.auth.currentUser?._id ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const queryOptions = useMemo(() => ({ skip: !currentUserId }), [currentUserId]);
  const notificationsResponse = useGetNotificationsQuery(undefined, queryOptions);
  const unreadCountResponse = useGetUnreadCountQuery(undefined, queryOptions);
  const [markAsRead, { isLoading: isMarkingRead }] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAllRead }] = useMarkAllAsReadMutation();

  useEffect(() => {
    if (!socket || !currentUserId) {
      return;
    }

    const onNotification = (notification: NotificationItem) => {
      dispatch(
        notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
          const notifications = draft.data ?? [];
          const exists = notifications.some((item) => item._id === notification._id);
          if (!exists) {
            draft.data = [notification, ...notifications];
          }
        }),
      );

      dispatch(
        notificationApi.util.updateQueryData('getUnreadCount', undefined, (draft) => {
          const currentCount = draft.data?.count ?? 0;
          draft.data = { count: notification.isRead ? currentCount : currentCount + 1 };
        }),
      );
    };

    socket.on('notification', onNotification);

    return () => {
      socket.off('notification', onNotification);
    };
  }, [currentUserId, dispatch, socket]);

  if (!currentUserId) {
    return null;
  }

  const notifications = notificationsResponse.data?.data ?? [];
  const unreadCount = unreadCountResponse.data?.data?.count ?? 0;

  return (
    <NotificationRoot>
      <NotificationButton
        type="button"
        aria-label="Notifications"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <FiBell size={17} />
        {unreadCount > 0 ? (
          <NotificationBadge>{unreadCount > 99 ? '99+' : unreadCount}</NotificationBadge>
        ) : null}
      </NotificationButton>

      {isOpen ? (
        <NotificationDropdown>
          <NotificationHeader>
            <strong>Notifications</strong>
            <button
              type="button"
              onClick={() => {
                void markAllAsRead();
              }}
              disabled={isMarkingAllRead || unreadCount === 0}
            >
              Mark all read
            </button>
          </NotificationHeader>

          {notifications.length > 0 ? (
            <NotificationList>
              {notifications.map((notification) => (
                <NotificationItemRow key={notification._id} $isRead={notification.isRead}>
                  <NotificationMessage>
                    <strong>{notification.type}</strong>
                    <span>{notification.message}</span>
                    <small>{formatNotificationTime(notification.createdAt)}</small>
                  </NotificationMessage>
                  {!notification.isRead ? (
                    <NotificationAction
                      type="button"
                      onClick={() => {
                        void markAsRead({ notificationId: notification._id });
                      }}
                      disabled={isMarkingRead}
                    >
                      Read
                    </NotificationAction>
                  ) : null}
                </NotificationItemRow>
              ))}
            </NotificationList>
          ) : (
            <NotificationEmpty>No notifications yet.</NotificationEmpty>
          )}
        </NotificationDropdown>
      ) : null}
    </NotificationRoot>
  );
};
