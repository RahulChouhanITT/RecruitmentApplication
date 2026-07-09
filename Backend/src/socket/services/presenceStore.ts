const onlineUsers = new Set<string>();
const userSockets = new Map<string, Set<string>>();

export const isUserOnline = (userId: string): boolean => onlineUsers.has(userId);

export const registerUserPresence = (userId: string, socketId: string): boolean => {
  const socketsForUser = userSockets.get(userId) ?? new Set<string>();
  const wasOffline = socketsForUser.size === 0;
  socketsForUser.add(socketId);
  userSockets.set(userId, socketsForUser);
  onlineUsers.add(userId);
  return wasOffline;
};

export const unregisterUserPresence = (userId: string, socketId: string): boolean => {
  const socketsForUser = userSockets.get(userId);
  if (!socketsForUser) {
    return false;
  }

  socketsForUser.delete(socketId);
  if (socketsForUser.size === 0) {
    userSockets.delete(userId);
    onlineUsers.delete(userId);
    return true;
  }

  userSockets.set(userId, socketsForUser);
  return false;
};
