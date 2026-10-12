/** Base URL of the Spring Boot API. Change it in one place. */
export const API_URL = 'http://localhost:8080/api';

/**
 * Message to show for a failed HTTP call.
 * Prefers the server's {"message": "..."} (see ApiExceptionHandler), so the admin sees the real reason.
 */
export function apiMessage(e: any, fallback: string): string {
  if (e?.status === 0) return "Can't reach the server at localhost:8080. Check that Spring Boot is running.";
  return e?.error?.message ?? fallback;
}
