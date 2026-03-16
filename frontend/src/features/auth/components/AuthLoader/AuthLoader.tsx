import type { AuthLoaderProps } from "../../types/authTypes";
import {
  LoaderCard,
  LoaderWrapper,
  SkeletonCircle,
  SkeletonLine,
  SkeletonRow,
} from "./AuthLoader.styles";

export const AuthLoader = ({ message = "Loading application..." }: AuthLoaderProps) => {
  return (
    <LoaderWrapper aria-live="polite" aria-busy="true" aria-label={message}>
      <LoaderCard>
        <SkeletonRow>
          <SkeletonCircle />
          <div style={{ width: "100%" }}>
            <SkeletonLine $width="55%" $height="0.95rem" />
            <div style={{ height: "0.45rem" }} />
            <SkeletonLine $width="35%" $height="0.8rem" />
          </div>
        </SkeletonRow>
        <SkeletonLine $width="100%" />
        <SkeletonLine $width="92%" />
        <SkeletonLine $width="78%" />
      </LoaderCard>
    </LoaderWrapper>
  );
};
