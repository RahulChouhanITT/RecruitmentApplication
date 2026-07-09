import styled from 'styled-components';

export const ScheduleWrap = styled.div`
  display: grid;
  gap: 0.9rem;
`;

export const StickyHeader = styled.div`
  position: sticky;
  top: -1px;
  z-index: 5;
  display: grid;
  gap: 0.7rem;
  background: radial-gradient(circle at 10% 20%, #fafafa 0%, #f5f5f5 45%, #f3f4f6 100%);
  padding: 0.2rem 0 0.2rem;
  border-bottom: 1px solid #dbe3ee;
  box-shadow: 0 10px 18px -18px rgba(16, 32, 58, 0.35);
`;

export const ScheduleTitle = styled.h3`
  margin: 0;
  font-size: 1.02rem;
  color: #10203a;
`;

export const ControlsRow = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 19.5rem) minmax(0, 1fr);
  align-items: center;
  gap: 0.7rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const FilterRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  justify-self: end;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;

export const FilterButton = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? '#111111' : '#d1d5db')};
  background: ${({ $active }) => ($active ? '#111111' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#374151')};
  border-radius: 999px;
  padding: 0.35rem 0.72rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
`;

export const InterviewsTableWrap = styled.div`
  border: 1px solid #dbe3ee;
  border-radius: 0.75rem;
  background: #fff;
  overflow: auto;
  scrollbar-gutter: stable;
`;

export const InterviewsTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.65rem 0.7rem;
    text-align: left;
    border-bottom: 1px solid #edf1f7;
    font-size: 0.8rem;
    color: #2b3e58;
    vertical-align: top;
  }

  th {
    font-size: 0.76rem;
    color: #5e718d;
    background: #f8faff;
    font-weight: 700;
    white-space: nowrap;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

export const FeedbackStatusButton = styled.button<{ $clickable?: boolean }>`
  border: none;
  background: transparent;
  color: ${({ $clickable }) => ($clickable ? '#1d4ed8' : '#5e718d')};
  border-radius: 0;
  padding: 0;
  font-size: 0.74rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  text-decoration: ${({ $clickable }) => ($clickable ? 'none' : 'none')};
  transition:
    color 120ms ease,
    text-decoration-color 120ms ease;

  &:hover {
    color: ${({ $clickable }) => ($clickable ? '#1e40af' : '#5e718d')};
    text-decoration: ${({ $clickable }) => ($clickable ? 'underline' : 'none')};
  }
`;

export const StatusBadge = styled.span<{ $tone: 'scheduled' | 'completed' | 'cancelled' }>`
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'completed' ? '#99dbbb' : $tone === 'cancelled' ? '#f0b5b5' : '#b7cdf6'};
  background: ${({ $tone }) =>
    $tone === 'completed' ? '#eaf9f0' : $tone === 'cancelled' ? '#fff1f2' : '#eaf1ff'};
  color: ${({ $tone }) =>
    $tone === 'completed' ? '#137a48' : $tone === 'cancelled' ? '#b42318' : '#1d4fa8'};
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1;
  padding: 0.24rem 0.48rem;
  text-transform: capitalize;
`;

export const FeedbackOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 3600;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(11, 20, 37, 0.42);
  padding: 1rem;
`;

export const FeedbackCard = styled.div`
  width: min(32rem, 100%);
  border: 1px solid #e5e7eb;
  border-radius: 0.95rem;
  background: #fff;
  box-shadow: 0 24px 46px rgba(16, 28, 48, 0.24);
  padding: 1.1rem 1.1rem 1rem;
  display: grid;
  gap: 0.78rem;
`;

export const FeedbackTitle = styled.h4`
  margin: 0;
  color: #10203a;
  font-size: 0.98rem;
  font-weight: 700;
`;

export const FeedbackLine = styled.p`
  margin: 0;
  color: #334964;
  font-size: 0.83rem;
  line-height: 1.5;
`;

export const FeedbackActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.65rem;
  flex-wrap: wrap;
  border-top: 1px solid #e7edf7;
  padding-top: 0.8rem;
`;

export const CloseButton = styled.button`
  border: 1px solid #cad4e7;
  background: #fff;
  color: #2f415f;
  border-radius: 0.55rem;
  padding: 0.42rem 0.74rem;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

export const DecisionActions = styled.div`
  display: inline-flex;
  gap: 0.5rem;
`;

export const DecisionButton = styled.button<{ $tone: 'green' | 'red' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid ${({ $tone }) => ($tone === 'green' ? '#89d0ae' : '#f2aab1')};
  background: ${({ $tone }) => ($tone === 'green' ? '#f1fbf6' : '#fff3f5')};
  color: ${({ $tone }) => ($tone === 'green' ? '#13764a' : '#b42318')};
  border-radius: 999px;
  padding: 0.38rem 0.78rem;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 120ms ease,
    filter 120ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(0.98);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const CandidateCell = styled.div`
  display: grid;
  gap: 0.12rem;

  strong {
    font-size: 0.8rem;
    color: #21334e;
  }

  span {
    color: #667b98;
    font-size: 0.72rem;
  }
`;

export const DecisionTag = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid #d4dceb;
  background: #f8faff;
  color: #355177;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.22rem 0.5rem;
`;

export const MenuContainer = styled.div`
  position: relative;
  display: inline-flex;
`;

export const MenuTrigger = styled.button`
  width: 2rem;
  height: 2rem;
  border: 1px solid #d6deea;
  border-radius: 999px;
  background: #ffffff;
  color: #40536f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: #f8faff;
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

export const FloatingMenuDropdown = styled.div`
  position: fixed;
  z-index: 3800;
  min-width: 12rem;
  padding: 0.35rem;
  border: 1px solid #dbe3ee;
  border-radius: 0.9rem;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(16, 28, 48, 0.16);
`;

export const MenuOption = styled.button<{ $tone?: 'default' | 'red' }>`
  width: 100%;
  border: none;
  border-radius: 0.65rem;
  background: transparent;
  color: ${({ $tone }) => ($tone === 'red' ? '#b42318' : '#21334e')};
  padding: 0.6rem 0.72rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${({ $tone }) => ($tone === 'red' ? '#fff1f2' : '#f8faff')};
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
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

export const ScheduleField = styled.div`
  display: grid;
  gap: 0.45rem;
`;

export const ScheduleLabel = styled.label`
  color: #21334e;
  font-size: 0.78rem;
  font-weight: 700;
`;

export const ScheduleSection = styled.div`
  border: 1px solid #e8edf4;
  border-radius: 0.7rem;
  background: #fbfdff;
  padding: 0.75rem;
  display: grid;
  gap: 0.55rem;
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

export const ScheduleInput = styled.input`
  width: 100%;
  min-height: 2.55rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fff;
  padding: 0.62rem 0.78rem;
  font-size: 0.9rem;
  color: #1f2937;

  &:focus {
    outline: none;
    border-color: #2f6fd6;
    box-shadow: 0 0 0 3px rgba(47, 111, 214, 0.14);
  }
`;

export const DurationGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
`;

export const DurationButton = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? '#1d4fa8' : '#e5e7eb')};
  background: ${({ $active }) => ($active ? '#2f6fd6' : '#fff')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#2d3f5f')};
  border-radius: 0.52rem;
  min-height: 2.5rem;
  padding: 0.5rem 0.55rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: #b8c6dc;
    transform: translateY(-1px);
  }
`;

export const ScheduleTextarea = styled.textarea`
  width: 100%;
  min-height: 6.8rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.72rem 0.78rem;
  font-size: 0.9rem;
  color: #1f2937;
  background: #fff;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #2f6fd6;
    box-shadow: 0 0 0 3px rgba(47, 111, 214, 0.14);
  }
`;

export const ScheduleError = styled.p`
  margin: 0;
  min-height: 1rem;
  color: #b42318;
  font-size: 0.72rem;
  font-weight: 600;
`;

export const ScheduleActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  flex-wrap: wrap;
  border-top: 1px solid #e7edf7;
  padding-top: 0.8rem;
`;

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid #1d4fa8;
  background: #1d4fa8;
  color: #ffffff;
  border-radius: 0.55rem;
  padding: 0.42rem 0.84rem;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;
