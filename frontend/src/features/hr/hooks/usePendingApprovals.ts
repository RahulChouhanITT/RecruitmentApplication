import { useMemo } from 'react';
import {
  useGetPendingApprovalsQuery,
  useUpdateApprovalStatusMutation,
} from '../../approval/api/approvalApi';
import { showToast, TOAST_TYPES } from '../../../utils/toast';
import { getHrErrorMessage } from '../handlers/hrErrorHandler';
import { HR_INTERVIEW_DEFAULT_MESSAGES } from '../labels/hrLabels';

export const usePendingApprovals = (isActive: boolean) => {
  const [updateApprovalStatus, { isLoading: isUpdatingApproval }] =
    useUpdateApprovalStatusMutation();
  const { data: pendingApprovalsResponse, isLoading: isPendingApprovalsLoading } =
    useGetPendingApprovalsQuery(undefined, {
      skip: !isActive,
    });

  const pendingUsers = useMemo(
    () => pendingApprovalsResponse?.data ?? [],
    [pendingApprovalsResponse?.data],
  );

  const onApprove = async (userId: string): Promise<void> => {
    try {
      const response = await updateApprovalStatus({ userId, isApproved: true }).unwrap();
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: response.message || HR_INTERVIEW_DEFAULT_MESSAGES.APPROVAL_SUCCESS,
      });
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getHrErrorMessage(error, HR_INTERVIEW_DEFAULT_MESSAGES.APPROVAL_FAILED),
      });
    }
  };

  return {
    pendingUsers,
    isUpdatingApproval,
    isPendingApprovalsLoading,
    onApprove,
  };
};
