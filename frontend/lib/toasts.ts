import { toast } from "sonner";

import { ApiError } from "@/lib/api";

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Session expired. Please sign in again.";
    if (error.status === 403) return "Permission denied.";
    if (error.status >= 500) return "Server error. Please try again.";
    return error.message;
  }

  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("network")) {
      return "Network error. Try again.";
    }
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(error: unknown, fallback: string) {
  toast.error(getApiErrorMessage(error) || fallback);
}
