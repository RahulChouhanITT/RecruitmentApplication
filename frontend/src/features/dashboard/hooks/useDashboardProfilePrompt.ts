import { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { showToast, TOAST_TYPES } from '../../../utils/toast';
import { setCurrentUser } from '../../auth/state/authSlice';
import { useCompleteProfileMutation } from '../../profile/api/profileApi';
import type { CompleteProfilePayload } from '../../profile/types';
import { DASHBOARD_MESSAGES, DASHBOARD_PROFILE_LABELS } from '../labels/dashboardLabels';
import { getDashboardErrorMessage } from '../handlers/dashboardErrorHandler';
import type { AuthUser } from '../../auth/types';

type UseDashboardProfilePromptParams = {
  currentUser?: AuthUser | null;
};

export const useDashboardProfilePrompt = ({
  currentUser,
}: UseDashboardProfilePromptParams) => {
  const dispatch = useAppDispatch();
  const [completeProfileMutation, { isLoading: isCompletingProfile }] =
    useCompleteProfileMutation();
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [dismissedProfilePromptForUserId, setDismissedProfilePromptForUserId] = useState<
    string | null
  >(null);

  const isCandidateUser = currentUser?.role === 'candidate';
  const shouldPromptForProfileCompletion = Boolean(currentUser && !currentUser.profileCompleted);
  const profilePromptMessage = isCandidateUser
    ? DASHBOARD_PROFILE_LABELS.CANDIDATE_PROMPT
    : DASHBOARD_PROFILE_LABELS.DEFAULT_PROMPT;
  const isProfilePromptOpen =
    shouldPromptForProfileCompletion &&
    !isProfileFormOpen &&
    dismissedProfilePromptForUserId !== (currentUser?._id ?? null);

  const onCancelProfilePrompt = (): void => {
    setDismissedProfilePromptForUserId(currentUser?._id ?? null);
  };

  const onOpenProfileForm = (): void => {
    setIsProfileFormOpen(true);
  };

  const onCancelProfileForm = (): void => {
    setIsProfileFormOpen(false);
  };

  const onSubmitProfile = async (payload: CompleteProfilePayload): Promise<void> => {
    try {
      const response = await completeProfileMutation(payload).unwrap();
      dispatch(
        setCurrentUser(
          currentUser
            ? {
                ...currentUser,
                ...payload,
                ...response.data,
                name: response.data?.name || currentUser.name,
                profileCompleted: response.data?.profileCompleted ?? true,
              }
            : (response.data ?? null),
        ),
      );
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: response.message || DASHBOARD_MESSAGES.PROFILE_COMPLETED_SUCCESS,
      });
      setIsProfileFormOpen(false);
      setDismissedProfilePromptForUserId(null);
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getDashboardErrorMessage(error, DASHBOARD_MESSAGES.PROFILE_COMPLETED_FAILED),
      });
    }
  };

  return {
    isCompletingProfile,
    isCandidateUser,
    isProfilePromptOpen,
    isProfileFormOpen,
    profilePromptMessage,
    onCancelProfilePrompt,
    onOpenProfileForm,
    onCancelProfileForm,
    onSubmitProfile,
  };
};
