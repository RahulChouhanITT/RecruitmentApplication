import { authenticationMiddleware } from "../../middleware/authenticationMiddleware";
import { authorizeRoles } from "../../middleware/authorizationMiddleware";
import type { UserRole } from "../types/authTypes";

export const withAuthorizedRoles = (roles: readonly UserRole[]) => [
  authenticationMiddleware,
  authorizeRoles([...roles]),
];
