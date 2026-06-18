import axios from "axios";

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data as
    | { message?: unknown; error?: unknown }
    | undefined;
  const message = data?.message;

  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string" && message) return message;
  if (typeof data?.error === "string" && data.error) return data.error;

  return error.message || fallback;
};
