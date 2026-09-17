import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Guards queries that interpolate a URL segment into a `uuid` column. Postgres
 * raises `invalid input syntax for type uuid` on a malformed value, which would
 * surface as a 500 rather than a 404 for a hand-typed URL.
 */
export function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}
