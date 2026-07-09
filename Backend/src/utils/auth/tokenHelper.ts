import jwt from 'jsonwebtoken';
import { env } from '../../configuration/env';
import { APPLICATION_CONSTANTS } from '../constants/applicationConstants';
import type { AuthenticatedUserPayload } from '../types/authTypes';

export const generateAuthenticationToken = (userIdentifier: string): string => {
  return jwt.sign({ userId: userIdentifier }, env.JWT_SECRET, {
    expiresIn: APPLICATION_CONSTANTS.TOKEN_EXPIRES_IN,
  });
};

export const verifyAuthenticationToken = (token: string): AuthenticatedUserPayload => {
  return jwt.verify(token, env.JWT_SECRET) as AuthenticatedUserPayload;
};
