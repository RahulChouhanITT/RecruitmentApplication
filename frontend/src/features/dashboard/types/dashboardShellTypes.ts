import type { ReactNode } from 'react';

export type LeftRailItem = {
  id: string;
  label: string;
  icon: ReactNode;
};

export type LeftPanelItemData = {
  id: string;
  title: string;
  subtitle: string;
  appRailId?: string;
  avatarText?: string;
  presence?: 'online' | 'offline';
  unreadCount?: number;
};
