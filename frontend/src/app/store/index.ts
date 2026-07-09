import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../../features/auth/api/authApi';
import { approvalApi } from '../../features/approval/api/approvalApi';
import { chatApi } from '../../features/chat/api/chatApi';
import { interviewerDirectoryApi } from '../../features/hr/api/interviewerDirectoryApi';
import { jobsApi } from '../../features/jobs/api/jobsApi';
import { notificationApi } from '../../features/notifications/api/notificationApi';
import { profileApi } from '../../features/profile/api/profileApi';
import { resumeApi } from '../../features/profile/api/resumeApi';
import { rootReducer } from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      approvalApi.middleware,
      jobsApi.middleware,
      chatApi.middleware,
      interviewerDirectoryApi.middleware,
      notificationApi.middleware,
      profileApi.middleware,
      resumeApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
