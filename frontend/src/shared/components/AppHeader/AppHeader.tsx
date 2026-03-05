import { FaBuilding, FaUserCircle } from "react-icons/fa";
import { useAppSelector } from "../../../app/hooks";
import {
  BrandLogo,
  BrandName,
  BrandRow,
  HeaderInner,
  HeaderRoot,
  UserName,
  UserRow,
} from "./AppHeader.styles";

type AppHeaderProps = {
  brandName?: string;
  showUserName?: boolean;
};

export const AppHeader = ({ brandName = "JOB Portal ", showUserName = true }: AppHeaderProps) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  return (
    <HeaderRoot>
      <HeaderInner>
        <BrandRow>
          <BrandLogo>
            <FaBuilding size={14} />
          </BrandLogo>
          <BrandName>{brandName}</BrandName>
        </BrandRow>

        {showUserName && currentUser ? (
          <UserRow>
            <UserName>{currentUser.name}</UserName>
            <FaUserCircle size={25} />
          </UserRow>
        ) : null}
      </HeaderInner>
    </HeaderRoot>
  );
};
