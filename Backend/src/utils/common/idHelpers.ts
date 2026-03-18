export const toIdString = (value?: { toString(): string } | string | null): string =>
  typeof value === "string" ? value : value?.toString() ?? "";
