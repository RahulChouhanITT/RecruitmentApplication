import { DashboardDescription } from "../../../dashboard/pages/DashboardPage/DashboardPage.styles";
import { EmptyStateCard } from "../../../dashboard/components/EmptyStateCard/EmptyStateCard";
import { FiClock } from "react-icons/fi";
import { usePendingApprovals } from "../../hooks/usePendingApprovals";
import { HR_INTERVIEW_DEFAULT_MESSAGES, HR_INTERVIEW_UI_TEXT } from "../../labels/hrLabels";
import type { PendingApprovalsPanelProps } from "../../types/hrTypes";
import {
  ApproveButton,
  PendingRequestActions,
  PendingRequestCard,
  PendingRequestsCount,
  PendingRequestInfo,
  PendingRequestsGrid,
  PendingRequestsHeader,
  PendingRequestsSection,
  PendingRequestsTitle,
} from "./PendingApprovalsPanel.styles";

export const PendingApprovalsPanel = ({ isActive }: PendingApprovalsPanelProps) => {
  const { pendingUsers, isUpdatingApproval, isPendingApprovalsLoading, onApprove } = usePendingApprovals(isActive);

  if (!isActive) {
    return null;
  }

  if (isPendingApprovalsLoading) {
    return <DashboardDescription>{HR_INTERVIEW_DEFAULT_MESSAGES.PENDING_APPROVALS_LOADING}</DashboardDescription>;
  }

  if (pendingUsers.length === 0) {
    return (
      <EmptyStateCard
        icon={FiClock}
        title={HR_INTERVIEW_DEFAULT_MESSAGES.PENDING_APPROVALS_EMPTY_TITLE}
        description={HR_INTERVIEW_DEFAULT_MESSAGES.PENDING_APPROVALS_EMPTY_DESCRIPTION}
      />
    );
  }

  return (
    <PendingRequestsSection>
      <PendingRequestsHeader>
        <PendingRequestsTitle>{HR_INTERVIEW_UI_TEXT.PENDING_REQUESTS_TITLE}</PendingRequestsTitle>
        <PendingRequestsCount>
          {pendingUsers.length} {HR_INTERVIEW_UI_TEXT.REQUESTS_SUFFIX}
        </PendingRequestsCount>
      </PendingRequestsHeader>

      <PendingRequestsGrid>
        {pendingUsers.map((user) => (
          <PendingRequestCard key={user._id}>
            <PendingRequestInfo>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              <span>
                {HR_INTERVIEW_UI_TEXT.ROLE_PREFIX} {user.role}
              </span>
            </PendingRequestInfo>

            <PendingRequestActions>
              <ApproveButton type="button" disabled={isUpdatingApproval} onClick={() => onApprove(user._id)}>
                {HR_INTERVIEW_UI_TEXT.APPROVE}
              </ApproveButton>
            </PendingRequestActions>
          </PendingRequestCard>
        ))}
      </PendingRequestsGrid>
    </PendingRequestsSection>
  );
};
