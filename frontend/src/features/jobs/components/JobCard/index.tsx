import { FiBriefcase, FiFileText, FiLayers } from 'react-icons/fi';
import { JOBS_UI_TEXT } from '../../labels/jobLabels';
import type { JobCardProps } from '../../types/jobTypes';
import { ActionButton, Card, Header, Meta, StatusPill, Title } from './JobCard.styles';

export const JobCard = ({
  title,
  experience,
  requiredSkills,
  description,
  isActive,
  isApplied,
  isApplying,
  onApply,
}: JobCardProps) => {
  return (
    <Card>
      <Header>
        <Title>{title}</Title>
        <StatusPill $active={isActive}>
          {isActive ? JOBS_UI_TEXT.STATUS_ACTIVE_HIRING : JOBS_UI_TEXT.STATUS_CLOSED}
        </StatusPill>
      </Header>
      <Meta>
        <FiBriefcase size={14} /> {experience}
      </Meta>
      <Meta>
        <FiLayers size={14} /> {requiredSkills}
      </Meta>
      <Meta>
        <FiFileText size={14} /> {description}
      </Meta>
      <ActionButton type="button" disabled={isApplying || isApplied} onClick={onApply}>
        {isApplied ? JOBS_UI_TEXT.STATUS_APPLIED : JOBS_UI_TEXT.ACTION_APPLY}
      </ActionButton>
    </Card>
  );
};
