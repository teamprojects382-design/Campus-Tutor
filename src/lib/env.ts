import { z } from "zod";

const AI_PROVIDERS = ["openai", "anthropic", "google"] as const;
const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;

const envBaseSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  AI_PROVIDER: z.enum(AI_PROVIDERS).default("openai"),
  AI_API_KEY: z.string().min(1).optional(),
  AI_MODEL: z.string().min(1),
  EMBEDDING_MODEL: z.string().min(1),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().int().positive().default(20),
  MAX_GENERATIONS_PER_USER_PER_DAY: z.coerce.number().int().nonnegative().default(50),
  LOG_LEVEL: z.enum(LOG_LEVELS).default("info"),
});

function formatIssues(issues: z.ZodIssue[]) {
  return issues
    .map((issue) => `- ${issue.path.join(".") || "value"}: ${issue.message}`)
    .join("\n");
}

export function createEnvSchema(env: Record<string, string | undefined>) {
  return envBaseSchema.safeParse(env);
}

function readValidatedEnv() {
  const skipValidation = process.env.SKIP_ENV_VALIDATION === "1" || process.env.SKIP_ENV_VALIDATION === "true";

  if (skipValidation) {
    return {
      NODE_ENV: process.env.NODE_ENV ?? "development",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
      AI_PROVIDER: process.env.AI_PROVIDER ?? "openai",
      AI_API_KEY: process.env.AI_API_KEY,
      AI_MODEL: process.env.AI_MODEL ?? "gpt-4o-mini",
      EMBEDDING_MODEL: process.env.EMBEDDING_MODEL ?? "text-embedding-3-small",
      MAX_UPLOAD_SIZE_MB: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 20),
      MAX_GENERATIONS_PER_USER_PER_DAY: Number(process.env.MAX_GENERATIONS_PER_USER_PER_DAY ?? 50),
      LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
    } as const;
  }

  const parsed = createEnvSchema(process.env);

  if (!parsed.success) {
    throw new Error(`Invalid environment configuration.\n${formatIssues(parsed.error.issues)}`);
  }

  return parsed.data;
}

export const clientEnv = {
  get NEXT_PUBLIC_APP_URL() {
    return readValidatedEnv().NEXT_PUBLIC_APP_URL;
  },
  get NEXT_PUBLIC_SUPABASE_URL() {
    return readValidatedEnv().NEXT_PUBLIC_SUPABASE_URL;
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return readValidatedEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY;
  },
} as const;

export const serverEnv = {
  get NODE_ENV() {
    return readValidatedEnv().NODE_ENV;
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return readValidatedEnv().SUPABASE_SERVICE_ROLE_KEY;
  },
  get AI_PROVIDER() {
    return readValidatedEnv().AI_PROVIDER;
  },
  get AI_API_KEY() {
    return readValidatedEnv().AI_API_KEY;
  },
  get AI_MODEL() {
    return readValidatedEnv().AI_MODEL;
  },
  get EMBEDDING_MODEL() {
    return readValidatedEnv().EMBEDDING_MODEL;
  },
  get MAX_UPLOAD_SIZE_MB() {
    return readValidatedEnv().MAX_UPLOAD_SIZE_MB;
  },
  get MAX_GENERATIONS_PER_USER_PER_DAY() {
    return readValidatedEnv().MAX_GENERATIONS_PER_USER_PER_DAY;
  },
  get LOG_LEVEL() {
    return readValidatedEnv().LOG_LEVEL;
  },
} as const;

export const env = {
  get NODE_ENV() {
    return readValidatedEnv().NODE_ENV;
  },
  get NEXT_PUBLIC_APP_URL() {
    return readValidatedEnv().NEXT_PUBLIC_APP_URL;
  },
  get NEXT_PUBLIC_SUPABASE_URL() {
    return readValidatedEnv().NEXT_PUBLIC_SUPABASE_URL;
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return readValidatedEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY;
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return readValidatedEnv().SUPABASE_SERVICE_ROLE_KEY;
  },
  get AI_PROVIDER() {
    return readValidatedEnv().AI_PROVIDER;
  },
  get AI_API_KEY() {
    return readValidatedEnv().AI_API_KEY;
  },
  get AI_MODEL() {
    return readValidatedEnv().AI_MODEL;
  },
  get EMBEDDING_MODEL() {
    return readValidatedEnv().EMBEDDING_MODEL;
  },
  get MAX_UPLOAD_SIZE_MB() {
    return readValidatedEnv().MAX_UPLOAD_SIZE_MB;
  },
  get MAX_GENERATIONS_PER_USER_PER_DAY() {
    return readValidatedEnv().MAX_GENERATIONS_PER_USER_PER_DAY;
  },
  get LOG_LEVEL() {
    return readValidatedEnv().LOG_LEVEL;
  },
} as const;
