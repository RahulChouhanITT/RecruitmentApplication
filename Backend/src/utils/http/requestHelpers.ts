import { CONFIGURATION_CONSTANTS } from '../constants/configurationConstants';

export const isBooleanValue = (value: unknown): value is boolean => typeof value === 'boolean';

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== CONFIGURATION_CONSTANTS.DEFAULTS.EMPTY_STRING;
