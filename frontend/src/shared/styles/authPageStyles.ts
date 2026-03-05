import type { CSSProperties } from "react";
import { theme } from "./theme";

export const pageContentStyles: CSSProperties = {
  width: "100%",
};

export const authSwitchTextStyles: CSSProperties = {
  marginTop: theme.spacing.sm,
  marginBottom: 0,
  fontSize: "14px",
  color: theme.colors.textMuted,
  textAlign: "center",
};

export const authSwitchLinkStyles: CSSProperties = {
  color: theme.colors.brandDark,
  textDecoration: "none",
  fontWeight: 600,
};

export const formStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.md,
};
