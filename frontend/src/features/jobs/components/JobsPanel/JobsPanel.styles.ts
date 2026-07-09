import styled, { type DefaultTheme } from 'styled-components';

const cardMotion = `
  @keyframes fadeUpPanelCard {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const PanelWrap = styled.div`
  margin-top: 1rem;
  display: grid;
  gap: 0.75rem;
`;

export const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  justify-self: end;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;

export const ControlsBar = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 20rem) minmax(0, 1fr);
  align-items: center;
  gap: 0.65rem;
  position: sticky;
  top: 0;
  z-index: 2;
  background: transparent;
  padding: 0.2rem 0;
  border-bottom: 1px solid rgba(183, 202, 232, 0.45);

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const ApplicationsGrid = styled.div`
  display: grid;
  gap: 0.75rem;
`;

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: #000000;
`;

export const BackButton = styled.button`
  border: 1px solid #d5deec;
  background: #ffffff;
  color: #2d3f5f;
  border-radius: 999px;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition:
    border-color 0.16s ease,
    color 0.16s ease,
    background-color 0.16s ease;

  &:hover {
    border-color: #b8c6dc;
    color: #000000;
    background: #f8fafc;
  }

  &::after {
    content: 'Back to Jobs';
    position: absolute;
    left: calc(100% + 0.45rem);
    top: 50%;
    transform: translateY(-50%) translateX(-6px);
    background: #000000;
    color: #ffffff;
    border-radius: 0.35rem;
    padding: 0.25rem 0.45rem;
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
  }

  &:hover::after,
  &:focus-visible::after {
    opacity: 1;
    visibility: visible;
    transform: translateY(-50%) translateX(0);
  }
`;

export const ApplicationsTableWrap = styled.div`
  border: 1px solid #d5deec;
  border-radius: 0.75rem;
  background: #ffffff;
  position: relative;
  overflow-x: auto;
  overflow-y: visible;
  scrollbar-gutter: stable;
`;

export const ApplicationsTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.65rem 0.7rem;
    text-align: left;
    border-bottom: 1px solid #d5deec;
    font-size: 0.8rem;
    color: #334155;
    vertical-align: top;
  }

  th {
    font-size: 0.76rem;
    color: #475569;
    background: #f8fafc;
    font-weight: 700;
    white-space: nowrap;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tbody tr {
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  tbody tr:hover {
    background: #f8fafc;
  }

  tbody tr:hover td:last-child button {
    opacity: 1;
  }

  tbody tr[data-selected='true'] {
    background: #f8fafc; 
  }

  tbody tr[data-selected='true'] td:last-child button {
    opacity: 1;
  }

  th:last-child,
  td:last-child {
    text-align: center;
    width: 3rem;
  }
`;

export const TableStatusText = styled.span`
  font-size: 0.78rem;
  color: #334155;
  font-weight: 600;
`;

type StatusToneKey = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'HIRED' | 'REJECTED';

const getStatusTone = (theme: DefaultTheme, status: StatusToneKey) => {
  switch (status) {
    case 'APPLIED':
      return {
        text: theme.colors.info,
        bg: theme.colors.infoBackground,
        border: theme.colors.infoBorder,
        dot: '#6b7280',
      };
    case 'SHORTLISTED':
      return {
        text: theme.colors.primary,
        bg: theme.colors.primaryLight,
        border: theme.colors.primaryBorder,
        dot: theme.colors.inputFocus,
      };
    case 'INTERVIEW_SCHEDULED':
      return {
        text: theme.colors.purple,
        bg: theme.colors.purpleBackground,
        border: theme.colors.purpleBorder,
        dot: theme.colors.purpleBorder,
      };
    case 'HIRED':
      return {
        text: theme.colors.success,
        bg: theme.colors.successBackground,
        border: theme.colors.successBorder,
        dot: theme.colors.successBorder,
      };
    case 'REJECTED':
    default:
      return {
        text: theme.colors.danger,
        bg: theme.colors.dangerBackground,
        border: theme.colors.dangerBorder,
        dot: theme.colors.dangerBorder,
      };
  }
};

export const StatusBadge = styled.span<{ $status: StatusToneKey }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid ${({ theme, $status }) => getStatusTone(theme, $status).border};
  background: ${({ theme, $status }) => getStatusTone(theme, $status).bg};
  color: ${({ theme, $status }) => getStatusTone(theme, $status).text};
  border-radius: 999px;
  padding: 0.18rem 0.52rem;
  font-size: 0.73rem;
  font-weight: 700;
  white-space: nowrap;
`;

export const StatusDot = styled.span<{ $status: StatusToneKey }>`
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  background: ${({ theme, $status }) => getStatusTone(theme, $status).dot};
  flex-shrink: 0;
`;

export const StatusOptionList = styled.div`
  display: grid;
  gap: 0.25rem;
  margin-top: 0.15rem;
`;

export const StatusSelectionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
`;

export const ScheduleTimeLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
  gap: 0.85rem;
  align-items: start;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const DurationGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
`;

export const DurationButton = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : '#e5e7eb')};
  background: ${({ theme, $active }) => ($active ? theme.colors.inputFocus : theme.colors.white)};
  color: ${({ theme, $active }) => ($active ? theme.colors.white : '#2d3f5f')};
  border-radius: 0.52rem;
  min-height: 2.5rem;
  padding: 0.5rem 0.55rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background-color 0.16s ease,
    color 0.16s ease,
    transform 0.16s ease;

  &:hover {
    border-color: #b8c6dc;
    transform: translateY(-1px);
  }
`;

export const ScheduleModalCard = styled.div`
  width: min(36rem, 100%);
  max-height: none;
  overflow: visible;
  border: 1px solid #e5e7eb;
  border-radius: 0.85rem;
  background: #ffffff;
  box-shadow: 0 18px 36px rgba(16, 28, 48, 0.18);
  padding: 1.1rem;
  display: grid;
  gap: 1rem;

  .schedule-picker-wrap {
    width: 100%;
    display: block;
  }

  .schedule-picker-wrap input {
    width: 100%;
    min-height: 2.55rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background: #ffffff;
    padding: 0.62rem 0.78rem;
    font-size: 0.9rem;
    color: #1f2937;
  }

  .schedule-picker-wrap input:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(47, 111, 214, 0.14);
  }

  select,
  textarea {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }

  select:focus,
  textarea:focus {
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(47, 111, 214, 0.14);
  }

  .schedule-datepicker-popper {
    z-index: 7000;
  }

  .schedule-datepicker-calendar {
    border: 1px solid #e5e7eb;
    border-radius: 0.7rem;
    box-shadow: 0 14px 28px rgba(16, 32, 58, 0.18);
  }
`;

export const ScheduleFormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const ScheduleSection = styled.div`
  border: 1px solid #e8edf4;
  border-radius: 0.7rem;
  background: #fbfdff;
  padding: 0.75rem;
  display: grid;
  gap: 0.55rem;
`;

export const StatusOptionButton = styled.button<{
  $selected?: boolean;
  $status: StatusToneKey;
}>`
  border: none;
  background: ${({ theme, $selected }) => ($selected ? theme.colors.infoBackground : 'transparent')};
  border-radius: 0.45rem;
  padding: 0.42rem 0.55rem;
  font-size: 0.8rem;
  color: ${({ theme, $status }) => getStatusTone(theme, $status).text};
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0;

  &:hover {
    background: #f8fafc;
  }
`;

export const SelectedOptionHint = styled.span<{ $status: StatusToneKey }>`
  font-size: 0.74rem;
  font-weight: 700;
  color: ${({ theme, $status }) => getStatusTone(theme, $status).text};
`;

export const StatusText = styled.span<{ $status: StatusToneKey }>`
  color: ${({ theme, $status }) => getStatusTone(theme, $status).text};
  font-weight: 700;
  font-size: 0.82rem;
`;

export const MenuContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

export const MenuTrigger = styled.button`
  border: none;
  background: transparent;
  color: #2d3f5f;
  border-radius: 0.25rem;
  width: auto;
  height: auto;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.14s ease,
    color 0.14s ease;

  &:hover {
    color: #000000;
    opacity: 0.9;
  }

  &:focus-visible {
    opacity: 1;
    outline: 2px solid rgba(47, 111, 214, 0.2);
    outline-offset: 2px;
  }
`;

export const MenuDropdown = styled.div`
  position: absolute;
  right: 0.15rem;
  top: calc(100% + 0.3rem);
  min-width: 10.5rem;
  border: 1px solid #d5deec;
  border-radius: 0.55rem;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(16, 32, 58, 0.16);
  display: grid;
  z-index: 1500;
`;

export const FloatingMenuDropdown = styled.div`
  position: fixed;
  min-width: 10.5rem;
  border: 1px solid #d5deec;
  border-radius: 0.55rem;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(16, 32, 58, 0.16);
  display: grid;
  z-index: 6000;
  padding: 0.2rem 0;
`;

export const MenuOption = styled.button<{ $tone?: 'default' | 'green' | 'red' }>`
  border: none;
  background: transparent;
  padding: 0.5rem 0.75rem;
  text-align: left;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? '#16794d'
      : $tone === 'red'
        ? '#dc2626'
        : '#334155'};
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
    color: ${({ $tone }) =>
      $tone === 'green'
        ? '#16794d'
        : $tone === 'red'
          ? '#dc2626'
          : '#000000'};
  }
`;

export const ConfirmMessage = styled.p`
  margin: 0;
  color: #384e6d;
  font-size: 0.84rem;
  line-height: 1.4;
`;

export const StatusSelect = styled.select`
  min-height: 2rem;
  border: 1px solid #d5deec;
  border-radius: 0.45rem;
  background: #ffffff;
  padding: 0.3rem 0.45rem;
  font-size: 0.76rem;
  color:#334155;

  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
`;

export const TinyButton = styled.button`
  border: 1px solid #d5deec;
  background: #ffffff;
  color: #2d3f5f;
  border-radius: 0.4rem;
  padding: 0.25rem 0.45rem;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: #aec3e4;
    color: #000000;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const FilterButton = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? '#000000' : '#d5deec')};
  background: ${({ $active }) => ($active ? '#000000' : '#ffffff')};
  color: ${({ theme, $active }) => ($active ? theme.colors.white : '#2d3f5f')};
  border-radius: 999px;
  padding: 0.32rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
`;

export const FilterSelect = styled.select`
  border: 1px solid #d5deec;
  background: #ffffff;
  color: #2d3f5f;
  border-radius: 999px;
  padding: 0.38rem 2rem 0.38rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 2rem;
  outline: none;
  justify-self: end;

  &:focus {
    border-color: #4285f4;
  }

  option {
    background: #ffffff;
    color: #000000;
    font-weight: 700;
  }
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export const FloatingAddButton = styled.button`
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  border: 1px solid #000000;
  background: #000000;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  z-index: 1100;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
  isolation: isolate;

  &:hover {
    background: #333333;
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.42);
  }

  &::after {
    content: 'Create Job';
    position: absolute;
    right: calc(100% + 0.55rem);
    top: 50%;
    transform: translateY(-50%) translateX(6px);
    background: #000000;
    color: #ffffff;
    border-radius: 0.35rem;
    padding: 0.3rem 0.5rem;
    font-size: 0.72rem;
    font-weight: 600;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition:
      opacity 0.16s ease,
      transform 0.16s ease;
  }

  &:hover::after,
  &:focus-visible::after {
    opacity: 1;
    visibility: visible;
    transform: translateY(-50%) translateX(0);
  }

  &:focus-visible {
    outline: 2px solid #000000;
    outline-offset: 2px;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const FieldGroup = styled.label`
  display: grid;
  gap: 0.25rem;
`;

export const FieldLabel = styled.span`
  font-size: 0.9rem;
  color: #1f2937;
  font-weight: 500;
`;

export const FieldLabelRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
`;

export const InfoIconWrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  color: #94a3b8;
  cursor: help;

  &:hover > span,
  &:focus-within > span {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

export const TooltipText = styled.span`
  position: absolute;
  bottom: calc(100% + 0.35rem);
  left: 0;
  transform: translateY(4px);
  width: max-content;
  max-width: 12rem;
  background: #000000;
  color: #ffffff;
  border-radius: 0.45rem;
  padding: 0.4rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.3;
  z-index: 5000;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
`;

export const Input = styled.input`
  min-height: 2.5rem;
  border: 1px solid #ddd;
  border-radius: 0.375rem;
  background: #ffffff;
  padding: 0.625rem 0.75rem;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

export const Select = styled.select`
  min-height: 2.5rem;
  border: 1px solid #ddd;
  border-radius: 0.375rem;
  background: #ffffff;
  padding: 0.625rem 0.75rem;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

export const Textarea = styled.textarea`
  border: 1px solid #ddd;
  border-radius: 0.375rem;
  background: #ffffff;
  padding: 0.625rem 0.75rem;
  font-size: 0.95rem;
  min-height: 5.5rem;
  resize: none;
  grid-column: 1 / -1;

  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

export const FieldError = styled.span`
  min-height: 1rem;
  font-size: 0.8rem;
  color: red;
  font-weight: 400;
  display: block;
  line-height: 1.2;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid #000000;
  background: #000000;
  color: #ffffff;
  border-radius: 0.5rem;
  padding: 0.45rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease;

  &:hover:not(:disabled) {
    background: #333333;
    border-color: #333333;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const GhostButton = styled.button`
  border: 1px solid #d5deec;
  background: #ffffff;
  color: #2d3f5f;
  border-radius: 0.5rem;
  padding: 0.45rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
`;

export const JobCard = styled.article`
  ${cardMotion}
  border: 1px solid #d5deec;
  border-radius: 0.75rem;
  background: #ffffff;
  padding: 0.9rem;
  display: grid;
  gap: 0.55rem;
  box-shadow: 0 8px 20px rgba(16, 32, 58, 0.07);
  animation: fadeUpPanelCard 220ms ease both;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #ccdaef;
    box-shadow: 0 14px 30px rgba(16, 32, 58, 0.11);
  }
`;

export const JobHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.7rem;
`;

export const JobTitleWrap = styled.div`
  display: grid;
  gap: 0.2rem;
`;

export const Title = styled.h4`
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
  text-transform: capitalize;
`;

export const StatusPill = styled.span<{ $active?: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? '#70c2a1' : '#c9d5e8')};
  color: ${({ $active }) => ($active ? '#16794d' : '#566a86')};
  background: ${({ $active }) => ($active ? '#ebf8f1' : '#f4f7fc')};
  border-radius: 999px;
  padding: 0.2rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
`;

export const JobMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
`;

export const JobMetaItem = styled.span`
  display: inline-flex;
  align-items: flex-start;
  gap: 0.35rem;
  color: #4f627f;
  font-size: 0.8rem;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

export const Meta = styled.span`
  color: #5a6c86;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
`;

export const JobDescription = styled.p`
  margin: 0;
  color: #34465f;
  font-size: 0.84rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
`;

export const JobDescriptionRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  color: #4f627f;

  svg {
    flex-shrink: 0;
    margin-top: 0.1rem;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 3500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(11, 20, 37, 0.42);
  padding: 1rem;
  overflow-y: auto;
`;

export const ModalCard = styled.div`
  width: min(34rem, 100%);
  max-height: none;
  overflow: visible;
  border: 1px solid #d5deec;
  border-radius: 0.95rem;
  background: #ffffff;
  box-shadow: 0 22px 44px rgba(16, 28, 48, 0.22);
  padding: 1rem;
  display: grid;
  gap: 0.8rem;
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

export const StickySectionHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fbfdff;
  padding: 0.5rem 0;
  display: grid;
  gap: 0.75rem;
`;
