import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { ButtonContent, Spinner, StyledButton } from './Button.styles';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean;
  }
>;

export const Button = ({ children, isLoading = false, disabled, ...buttonProps }: ButtonProps) => {
  return (
    <StyledButton {...buttonProps} disabled={disabled || isLoading}>
      <ButtonContent>
        {isLoading ? <Spinner aria-hidden="true" /> : null}
        <span>{children}</span>
      </ButtonContent>
    </StyledButton>
  );
};
