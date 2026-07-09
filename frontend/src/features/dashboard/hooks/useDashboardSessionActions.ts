import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../app/hooks';
import { showToast, TOAST_TYPES } from '../../../utils/toast';
import { authApi, useLogoutMutation } from '../../auth/api/authApi';
import { approvalApi } from '../../approval/api/approvalApi';
import { clearCurrentUser } from '../../auth/state/authSlice';
import { chatApi } from '../../chat/api/chatApi';
import { jobsApi } from '../../jobs/api/jobsApi';
import { notificationApi } from '../../notifications/api/notificationApi';
import { profileApi } from '../../profile/api/profileApi';
import { resumeApi } from '../../profile/api/resumeApi';
import { DASHBOARD_MESSAGES } from '../labels/dashboardLabels';
import { getDashboardErrorMessage } from '../handlers/dashboardErrorHandler';

export const useDashboardSessionActions = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const onRequestLogout = (): void => {
    setIsLogoutConfirmOpen(true);
  };

  const onCancelLogout = (): void => {
    if (isLoggingOut) {
      return;
    }

    setIsLogoutConfirmOpen(false);
  };

  const onConfirmLogout = async (): Promise<void> => {
    try {
      const response = await logoutMutation().unwrap();
      dispatch(clearCurrentUser());
      dispatch(authApi.util.resetApiState());
      dispatch(jobsApi.util.resetApiState());
      dispatch(chatApi.util.resetApiState());
      dispatch(notificationApi.util.resetApiState());
      dispatch(profileApi.util.resetApiState());
      dispatch(resumeApi.util.resetApiState());
      dispatch(approvalApi.util.resetApiState());
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: response.message || DASHBOARD_MESSAGES.LOGOUT_SUCCESS,
      });
      setIsLogoutConfirmOpen(false);
      navigate('/auth/login', { replace: true });
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getDashboardErrorMessage(error, DASHBOARD_MESSAGES.LOGOUT_FAILED),
      });
    }
  };

  return {
    isLoggingOut,
    isLogoutConfirmOpen,
    onRequestLogout,
    onCancelLogout,
    onConfirmLogout,
  };
};
