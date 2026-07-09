import { useEffect } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import type { SocketContextValue } from '../../../app/socket/socketContext';
import { notificationApi } from '../../notifications/api/notificationApi';

type UseDashboardRealtimeSyncParams = {
  currentUserId?: string;
  socket: SocketContextValue['socket'];
};

export const useDashboardRealtimeSync = ({
  currentUserId,
  socket,
}: UseDashboardRealtimeSyncParams) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!currentUserId || !socket) {
      return;
    }

    const onNotification = (): void => {
      void dispatch(notificationApi.util.invalidateTags([{ type: 'Notifications', id: 'LIST' }]));
      void dispatch(
        notificationApi.util.invalidateTags([{ type: 'Notifications', id: 'UNREAD_COUNT' }]),
      );
    };

    socket.on('notification', onNotification);

    return () => {
      socket.off('notification', onNotification);
    };
  }, [currentUserId, dispatch, socket]);
};
