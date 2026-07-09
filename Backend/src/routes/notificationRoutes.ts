import { Router } from 'express';
import {
  getNotifications,
  getNotificationUnreadCount,
  readAllNotifications,
  readNotification,
} from '../controllers/notification.controller';
import {
  NOTIFICATION_ROUTES,
  ROUTE_ROLE_GROUPS,
} from '../utils/constants/routeConstants';
import { asyncHandler } from '../utils/http/asyncHandler';
import { withAuthorizedRoles } from '../middleware/routeAuthorizationHelpers';

const notificationRouter = Router();

notificationRouter.use(...withAuthorizedRoles(ROUTE_ROLE_GROUPS.CHAT_ALLOWED));
notificationRouter.get(NOTIFICATION_ROUTES.ROOT, asyncHandler(getNotifications));
notificationRouter.get(
  NOTIFICATION_ROUTES.UNREAD_COUNT,
  asyncHandler(getNotificationUnreadCount),
);
notificationRouter.patch(NOTIFICATION_ROUTES.MARK_ALL_READ, asyncHandler(readAllNotifications));
notificationRouter.patch(NOTIFICATION_ROUTES.MARK_READ, asyncHandler(readNotification));

export default notificationRouter;
