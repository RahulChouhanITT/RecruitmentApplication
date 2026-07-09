import { FiBriefcase, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { JOBS_UI_TEXT } from '../../labels/jobLabels';
import type { InterviewCardProps } from '../../types/jobTypes';
import {
  ActionButton,
  ActionsRow,
  Card,
  Header,
  JoinButton,
  Meta,
  StatusBadge,
  Title,
} from './InterviewCard.styles';

export const InterviewCard = ({
  title,
  company,
  interviewDate,
  interviewTime,
  personName,
  personLabel = JOBS_UI_TEXT.INTERVIEW_PERSON_LABEL,
  meetingLink,
  variant,
  status = '',
  onActionClick,
  actionLabel,
}: InterviewCardProps) => {
  const normalizedStatus = status.trim().toUpperCase();
  const statusLabel =
    normalizedStatus === 'COMPLETED'
      ? JOBS_UI_TEXT.INTERVIEW_COMPLETED
      : normalizedStatus === 'CANCELLED'
        ? JOBS_UI_TEXT.INTERVIEW_CANCELLED
        : JOBS_UI_TEXT.INTERVIEW_SCHEDULED;

  return (
    <Card>
      <Header>
        <Title>{title}</Title>
        {status ? <StatusBadge $status={normalizedStatus}>{statusLabel}</StatusBadge> : null}
      </Header>
      <Meta>
        <FiBriefcase size={14} /> {JOBS_UI_TEXT.COMPANY_LABEL}: {company}
      </Meta>
      <Meta>
        <FiCalendar size={14} /> {JOBS_UI_TEXT.DATE_LABEL}: {interviewDate}
      </Meta>
      <Meta>
        <FiClock size={14} /> {JOBS_UI_TEXT.TIME_LABEL}: {interviewTime}
      </Meta>
      <Meta>
        <FiUser size={14} /> {personLabel}: {personName || '-'}
      </Meta>
      {variant === 'upcoming' && (meetingLink || (actionLabel && onActionClick)) ? (
        <ActionsRow>
          {meetingLink ? (
            <JoinButton href={meetingLink} target="_blank" rel="noreferrer">
              {JOBS_UI_TEXT.INTERVIEW_JOIN_MEETING}
            </JoinButton>
          ) : null}
          {actionLabel && onActionClick ? (
            <ActionButton type="button" onClick={onActionClick}>
              {actionLabel}
            </ActionButton>
          ) : null}
        </ActionsRow>
      ) : null}
    </Card>
  );
};
