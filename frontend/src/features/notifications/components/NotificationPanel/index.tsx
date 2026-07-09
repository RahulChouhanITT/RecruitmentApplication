import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from '../../api/notificationApi';
import {
  PanelAction,
  PanelCard,
  PanelEmpty,
  PanelHeader,
  PanelList,
  PanelMessage,
  PanelRoot,
} from './NotificationPanel.styles';

const formatNotificationTime = (value: string): string => {
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toLocaleString();
};

export const NotificationPanel = () => {
  const { data: notificationsResponse } = useGetNotificationsQuery();
  const [markAsRead, { isLoading: isMarkingRead }] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAllRead }] = useMarkAllAsReadMutation();
  const notifications = notificationsResponse?.data ?? [];
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <PanelRoot>
      <PanelHeader>
        <div>
          <h2>Notifications</h2>
          <p>Track application, interview, and status updates in one place.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            void markAllAsRead();
          }}
          disabled={isMarkingAllRead || unreadCount === 0}
        >
          Mark all read
        </button>
      </PanelHeader>

      {notifications.length > 0 ? (
        <PanelList>
          {notifications.map((notification) => (
            <PanelCard key={notification._id} $isRead={notification.isRead}>
              <PanelMessage>
                <strong>{notification.type}</strong>
                <span>{notification.message}</span>
                <small>{formatNotificationTime(notification.createdAt)}</small>
              </PanelMessage>
              {!notification.isRead ? (
                <PanelAction
                  type="button"
                  onClick={() => {
                    void markAsRead({ notificationId: notification._id });
                  }}
                  disabled={isMarkingRead}
                >
                  Read
                </PanelAction>
              ) : null}
            </PanelCard>
          ))}
        </PanelList>
      ) : (
        <PanelEmpty>No notifications yet.</PanelEmpty>
      )}
    </PanelRoot>
  );
};
