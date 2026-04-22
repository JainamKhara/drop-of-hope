import { toast } from "@/hooks/use-toast";

export interface ErrorContext {
  title?: string;
  description?: string;
  operation?: string;
  severity?: "error" | "warning" | "info";
}

/**
 * Centralized error handling utility
 * Logs errors to console and shows user-friendly toast notifications
 */
export const handleError = (error: unknown, context: ErrorContext = {}) => {
  const {
    title = "Error",
    description = "An unexpected error occurred",
    operation,
    severity = "error",
  } = context;

  // Log for debugging (includes operation context if provided)
  console.error(
    `[${operation || "Operation"}]`,
    error instanceof Error ? error.message : error,
  );

  // Show to user
  toast({
    title,
    description,
    variant: severity === "error" ? "destructive" : "default",
  });

  return { error, logged: true };
};

/**
 * Handle operation-specific errors with custom messaging
 */
export const handleOperationError = (
  error: unknown,
  operationName: string,
  userMessage: string,
) => {
  handleError(error, {
    title: operationName,
    description: userMessage,
    operation: operationName,
  });
};

/**
 * Safely extract error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    return (error as Record<string, unknown>).message as string;
  }
  return "An unexpected error occurred";
};
