import { useMemo } from "react";
import { useGetPendingApprovalsQuery, useUpdateApprovalStatusMutation } from "../../auth/api/authApi";
import { showToast, TOAST_TYPES } from "../../../utils/toast";
import { HR_INTERVIEW_DEFAULT_MESSAGES } from "../labels/hrLabels";
import { getHrErrorMessage } from "../utils/hrInterviewHelpers";

export const usePendingApprovals = (isActive: boolean) => {
  const [updateApprovalStatus, { isLoading: isUpdatingApproval }] = useUpdateApprovalStatusMutation();
  const {
    data: pendingApprovalsResponse,
    isLoading: isPendingApprovalsLoading,
  } = useGetPendingApprovalsQuery(undefined, {
    skip: !isActive,
  });

  const pendingUsers = useMemo(() => pendingApprovalsResponse?.data ?? [], [pendingApprovalsResponse?.data]);

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
