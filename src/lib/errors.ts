export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTH_ERROR"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMIT"
  | "EXTERNAL_SERVICE_ERROR"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly safeMessage: string;

  constructor(code: ErrorCode, status: number, message: string, safeMessage: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.safeMessage = safeMessage;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid input.", safeMessage = "Please review the submitted information and try again.") {
    super("VALIDATION_ERROR", 400, message, safeMessage);
  }
}

export class AuthError extends AppError {
  constructor(message = "Authentication failed.", safeMessage = "You need to sign in before continuing.") {
    super("AUTH_ERROR", 401, message, safeMessage);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden.", safeMessage = "You do not have permission to access this resource.") {
    super("FORBIDDEN", 403, message, safeMessage);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found.", safeMessage = "The requested resource could not be found.") {
    super("NOT_FOUND", 404, message, safeMessage);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests.", safeMessage = "You have reached the request limit. Please try again later.") {
    super("RATE_LIMIT", 429, message, safeMessage);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "External service unavailable.", safeMessage = "The service is temporarily unavailable. Please try again later.") {
    super("EXTERNAL_SERVICE_ERROR", 502, message, safeMessage);
  }
}

export function toSafeErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      success: false,
      code: error.code,
      message: error.safeMessage,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      code: "INTERNAL_SERVER_ERROR" as const,
      message: "Something went wrong. Please try again later.",
    };
  }

  return {
    success: false,
    code: "INTERNAL_SERVER_ERROR" as const,
    message: "Something went wrong. Please try again later.",
  };
}
