import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { StyledButton } from "./Button.styles";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export const Button = ({ children, ...buttonProps }: ButtonProps) => {
  return <StyledButton {...buttonProps}>{children}</StyledButton>;
};
