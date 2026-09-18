type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const redactValue = "[REDACTED]";
const redactedKeys = /key|token|secret|password|authorization/i;

function redact(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map((item) => redact(item));
  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        redactedKeys.test(key) ? redactValue : redact(value),
      ]),
    );
  }
  return obj;
}

function log(level: LogLevel, message: string, context?: LogContext, requestId?: string) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(requestId ? { requestId } : {}),
    ...(context ? { context: redact(context) } : {}),
  };

  const output = process.env.NODE_ENV === "production" ? JSON.stringify(payload) : JSON.stringify(payload, null, 2);

  if (level === "error") console.error(output);
  else if (level === "warn") console.warn(output);
  else if (level === "info") console.info(output);
  else console.debug(output);
}

export const logger = {
  debug: (message: string, context?: LogContext, requestId?: string) => log("debug", message, context, requestId),
  info: (message: string, context?: LogContext, requestId?: string) => log("info", message, context, requestId),
  warn: (message: string, context?: LogContext, requestId?: string) => log("warn", message, context, requestId),
  error: (message: string, context?: LogContext, requestId?: string) => log("error", message, context, requestId),
};

export type { LogLevel };
