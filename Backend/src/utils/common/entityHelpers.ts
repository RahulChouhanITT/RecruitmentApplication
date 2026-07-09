import { APPLICATION_CONSTANTS } from '../constants/applicationConstants';
import { ApplicationError } from '../errors/applicationError';

export const ensureEntity = <T>(
  entity: T | null | undefined,
  message: string,
  statusCode: number = APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
): NonNullable<T> => {
  if (!entity) {
    throw new ApplicationError(message, statusCode);
  }

  return entity as NonNullable<T>;
};

export function assertEntityExists<T>(
  entity: T | null | undefined,
  message: string,
  statusCode: number = APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
): asserts entity is NonNullable<T> {
  if (!entity) {
    throw new ApplicationError(message, statusCode);
  }
}
