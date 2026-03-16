import styled from "styled-components";

const getBadgeColors = (status: string) => {
  const normalizedStatus = status.trim().toLowerCase();

  if (normalizedStatus === "applied") {
    return { border: "#8eb8ff", text: "#1d4fa8", bg: "#eaf1ff" };
  }

  if (normalizedStatus === "under review") {
    return { border: "#f1d386", text: "#9a6b00", bg: "#fff6dd" };
  }

  if (normalizedStatus === "shortlisted") {
    return { border: "#8bd6b1", text: "#126946", bg: "#e9f9f1" };
  }

  if (normalizedStatus === "interview scheduled") {
    return { border: "#b6a3ef", text: "#5633b6", bg: "#f0ebff" };
  }

  if (normalizedStatus === "rejected") {
    return { border: "#f2a1a6", text: "#b22b35", bg: "#ffecee" };
  }

  if (normalizedStatus === "offer released") {
    return { border: "#77c78f", text: "#0c5530", bg: "#e3f7eb" };
  }

  return { border: "#c9d5e8", text: "#566a86", bg: "#f4f7fc" };
};

export const Badge = styled.span<{ $status: string }>`
  border: 1px solid ${({ $status }) => getBadgeColors($status).border};
  color: ${({ $status }) => getBadgeColors($status).text};
  background: ${({ $status }) => getBadgeColors($status).bg};
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
`;
