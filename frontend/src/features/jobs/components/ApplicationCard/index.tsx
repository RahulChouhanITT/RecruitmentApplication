import { FiBriefcase, FiFileText, FiLayers } from 'react-icons/fi';
import { JOBS_UI_TEXT } from '../../labels/jobLabels';
import type { ApplicationCardProps } from '../../types/jobTypes';
import { StatusBadge } from '../StatusBadge';
import { Card, Header, Meta, Title } from './ApplicationCard.styles';

export const ApplicationCard = ({
  title,
  experience,
  requiredSkills,
  description,
  status,
  appliedDate,
}: ApplicationCardProps) => {
  return (
    <Card>
      <Header>
        <Title>{title}</Title>
        <StatusBadge status={status} />
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
      <Meta>
        {JOBS_UI_TEXT.APPLICATION_APPLIED_ON}: {appliedDate}
      </Meta>
    </Card>
  );
};
