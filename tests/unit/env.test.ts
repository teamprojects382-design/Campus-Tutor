import { describe, expect, it } from "vitest";
import { createEnvSchema } from "@/lib/env";

describe("env validation", () => {
  it("rejects invalid environment variables", () => {
    const result = createEnvSchema({
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_URL: "https://example.com",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      AI_PROVIDER: "invalid-provider",
      AI_MODEL: "gpt-4o-mini",
      EMBEDDING_MODEL: "text-embedding-3-small",
      MAX_UPLOAD_SIZE_MB: "abc",
      MAX_GENERATIONS_PER_USER_PER_DAY: "50",
      LOG_LEVEL: "info",
    });

    expect(result.success).toBe(false);
  });
});
