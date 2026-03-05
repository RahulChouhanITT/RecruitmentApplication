import jwt from "jsonwebtoken";
import { APPLICATION_CONSTANTS } from "./constants/applicationConstants";
import type { AuthenticatedUserPayload } from "./types/authTypes";

export const generateAuthenticationToken = (userIdentifier: string): string => {
  return jwt.sign({ userId: userIdentifier }, process.env.JWT_SECRET_KEY as string, {
    expiresIn: APPLICATION_CONSTANTS.TOKEN_EXPIRES_IN,
  });
};

export const verifyAuthenticationToken = (token: string): AuthenticatedUserPayload => {
  return jwt.verify(token, process.env.JWT_SECRET_KEY as string) as AuthenticatedUserPayload;
};
