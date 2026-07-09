import { FaGoogle } from 'react-icons/fa';
import { AUTH_UI_TEXT } from '../../labels/authLabels';
import type { AuthRole } from '../../types/authTypes';
import { buildGoogleAuthUrl } from '../../utils/googleAuth';
import { GoogleButton, GoogleButtonContent } from './GoogleSignInButton.styles';

type GoogleSignInButtonProps = {
  role?: AuthRole;
};

export const GoogleSignInButton = ({ role }: GoogleSignInButtonProps) => {
  const onClick = (): void => {
    window.location.assign(buildGoogleAuthUrl(role));
  };

  return (
    <GoogleButton type="button" onClick={onClick}>
      <GoogleButtonContent>
        <FaGoogle aria-hidden="true" />
        <span>{AUTH_UI_TEXT.GOOGLE_LOGIN_BUTTON}</span>
      </GoogleButtonContent>
    </GoogleButton>
  );
};
