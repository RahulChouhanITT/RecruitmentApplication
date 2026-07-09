import { JOBS_DEFAULT_MESSAGES } from '../../labels/jobLabels';
import type { StatusBadgeProps } from '../../types/jobTypes';
import { Badge } from './StatusBadge.styles';

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return <Badge $status={status}>{status || JOBS_DEFAULT_MESSAGES.UNKNOWN_STATUS}</Badge>;
};
