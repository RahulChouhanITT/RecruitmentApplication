import styled from "styled-components";

const cardMotion = `
  @keyframes fadeUpInterviewCard {
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

export const Card = styled.article`
  ${cardMotion}
  border: 1px solid #dbe3ee;
  border-radius: 0.9rem;
  background: #fff;
  padding: 1rem;
  box-shadow: 0 6px 16px rgba(16, 32, 58, 0.06);
  display: grid;
  gap: 0.5rem;
  animation: fadeUpInterviewCard 220ms ease both;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #cfdcf2;
    box-shadow: 0 14px 28px rgba(16, 32, 58, 0.11);
  }

  @media (max-width: 640px) {
    padding: 0.85rem;
    gap: 0.48rem;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

export const Title = styled.h4`
  margin: 0;
  color: #10203a;
  font-size: 1rem;
  font-weight: 700;
  min-width: 0;
  flex: 1 1 12rem;
  overflow-wrap: anywhere;

  @media (max-width: 640px) {
    font-size: 0.95rem;
  }
`;

export const StatusBadge = styled.span<{ $status: string }>`
  border: 1px solid ${({ $status }) => ($status === "COMPLETED" ? "#9edcbc" : "#b7cdf6")};
  color: ${({ $status }) => ($status === "COMPLETED" ? "#137a48" : "#1d4fa8")};
  background: ${({ $status }) => ($status === "COMPLETED" ? "#eaf9f0" : "#eaf1ff")};
  border-radius: 999px;
  padding: 0.2rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: anywhere;
`;

export const Meta = styled.p`
  margin: 0;
  color: #425978;
  font-size: 0.84rem;
  line-height: 1.35;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 0.4rem;

  svg {
    margin-top: 0.1rem;
  }

  @media (max-width: 640px) {
    font-size: 0.8rem;
  }
`;

export const JoinButton = styled.a`
  border: 1px solid #cbd7ee;
  background: #f7faff;
  color: #1d4fa8;
  border-radius: 999px;
  padding: 0.38rem 0.74rem;
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;

  &:hover {
    background: #edf3ff;
    border-color: #b7c8eb;
  }

  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
    text-align: center;
  }
`;

export const ActionButton = styled.button`
  border: 1px solid #cbd7ee;
  background: #f7faff;
  color: #1d4fa8;
  border-radius: 999px;
  padding: 0.36rem 0.72rem;
  font-size: 0.77rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;

  &:hover {
    background: #edf3ff;
    border-color: #b7c8eb;
  }

  @media (max-width: 640px) {
    width: 100%;
    text-align: center;
  }
`;

export const ActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.48rem;
  margin-top: 0.05rem;
`;

export const ResultText = styled.span<{ $result: "Passed" | "Failed" | "Pending" }>`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ $result }) => {
    if ($result === "Passed") return "#137a48";
    if ($result === "Failed") return "#b42318";
    return "#566a86";
  }};
`;
