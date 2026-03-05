import { useMemo } from "react";
import { useGetPendingApprovalsQuery, useUpdateApprovalStatusMutation } from "../../../auth/api/authApi";
import { showToast, TOAST_TYPES } from "../../../../shared/utils/toast";
import { DashboardDescription } from "../../../dashboard/pages/DashboardPage/DashboardPage.styles";
import {
  ApproveButton,
  PendingRequestActions,
  PendingRequestCard,
  PendingRequestInfo,
  PendingRequestsGrid,
} from "./PendingApprovalsPanel.styles";

type PendingApprovalsPanelProps = {
  isActive: boolean;
};

export const PendingApprovalsPanel = ({ isActive }: PendingApprovalsPanelProps) => {
  const [updateApprovalStatus, { isLoading: isUpdatingApproval }] = useUpdateApprovalStatusMutation();

  const {
    data: pendingApprovalsResponse,
    isLoading: isPendingApprovalsLoading,
    refetch: refetchPendingApprovals,
  } = useGetPendingApprovalsQuery(undefined, {
    skip: !isActive,
  });

  const pendingUsers = useMemo(
    () => pendingApprovalsResponse?.data ?? [],
    [pendingApprovalsResponse?.data]
  );

  const onApprove = async (userId: string): Promise<void> => {
    try {
      const response = await updateApprovalStatus({ userId, isApproved: true }).unwrap();
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: response.message || "User approved successfully",
      });
      await refetchPendingApprovals();
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "Failed to approve user";

      showToast({
        type: TOAST_TYPES.ERROR,
        message,
      });
    }
  };

  if (!isActive) {
    return null;
  }

  if (isPendingApprovalsLoading) {
    return <DashboardDescription>Loading requests...</DashboardDescription>;
  }

  if (pendingUsers.length === 0) {
    return <DashboardDescription>No verified pending users found.</DashboardDescription>;
  }

  return (
    <PendingRequestsGrid>
      {pendingUsers.map((user) => (
        <PendingRequestCard key={user._id}>
          <PendingRequestInfo>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
            <span>Role: {user.role}</span>
          </PendingRequestInfo>

          <PendingRequestActions>
            <ApproveButton type="button" disabled={isUpdatingApproval} onClick={() => onApprove(user._id)}>
              Approve
            </ApproveButton>
          </PendingRequestActions>
        </PendingRequestCard>
      ))}
    </PendingRequestsGrid>
  );
};
