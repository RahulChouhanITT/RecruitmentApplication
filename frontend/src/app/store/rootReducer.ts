import { combineReducers } from '@reduxjs/toolkit';
import { authApi } from '../../features/auth/api/authApi';
import { approvalApi } from '../../features/approval/api/approvalApi';
import { chatApi } from '../../features/chat/api/chatApi';
import { interviewerDirectoryApi } from '../../features/hr/api/interviewerDirectoryApi';
import { jobsApi } from '../../features/jobs/api/jobsApi';
import { notificationApi } from '../../features/notifications/api/notificationApi';
import { profileApi } from '../../features/profile/api/profileApi';
import { resumeApi } from '../../features/profile/api/resumeApi';
import { authReducer } from '../../features/auth/state/authSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [approvalApi.reducerPath]: approvalApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [interviewerDirectoryApi.reducerPath]: interviewerDirectoryApi.reducer,
  [jobsApi.reducerPath]: jobsApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [resumeApi.reducerPath]: resumeApi.reducer,
});
