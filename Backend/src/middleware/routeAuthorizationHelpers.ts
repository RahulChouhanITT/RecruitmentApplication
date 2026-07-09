import { authenticateUser } from './authenticationMiddleware';
import { authorizeRoles } from './authorizationMiddleware';
import type { UserRole } from '../utils/types/authTypes';

export const withAuthorizedRoles = (roles: readonly UserRole[]) => [
  authenticateUser,
  authorizeRoles([...roles]),
];
