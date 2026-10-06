import { describe, expect, it, vi } from "vitest";

import { MAX_STUDY_SPACES_PER_USER } from "@/features/study-spaces/constants";
import { studySpaceIdSchema, studySpaceInputSchema } from "@/features/study-spaces/schemas/studySpace";
import { createStudySpace, getStudySpace } from "@/features/study-spaces/services/studySpaces";
import { NotFoundError, RateLimitError } from "@/lib/errors";

describe("study space schemas", () => {
  it("accepts valid study space input and normalizes values", () => {
    const result = studySpaceInputSchema.parse({
      name: "  Intro to   Biology  ",
      courseCode: "  BIO101  ",
      description: "  Final review notes  ",
    });

    expect(result).toEqual({
      name: "Intro to Biology",
      courseCode: "BIO101",
      description: "Final review notes",
    });
  });

  it("rejects invalid boundary lengths", () => {
    expect(() => studySpaceInputSchema.parse({ name: "x".repeat(101) })).toThrow();
    expect(() => studySpaceInputSchema.parse({ name: "x".repeat(100) })).not.toThrow();
    expect(() => studySpaceInputSchema.parse({ name: "ok", description: "x".repeat(501) })).toThrow();
    expect(() => studySpaceInputSchema.parse({ name: "ok", description: "x".repeat(500) })).not.toThrow();
    expect(() => studySpaceInputSchema.parse({ name: "ok", courseCode: "x".repeat(21) })).toThrow();
    expect(() => studySpaceInputSchema.parse({ name: "ok", courseCode: "x".repeat(20) })).not.toThrow();
  });

  it("collapses whitespace and converts empty optional fields to null", () => {
    const result = studySpaceInputSchema.parse({
      name: "  One\n\tTwo   Three  ",
      description: "   ",
      courseCode: "\n\t  ",
    });

    expect(result.name).toBe("One Two Three");
    expect(result.description).toBeNull();
    expect(result.courseCode).toBeNull();
  });

  it("rejects control characters and invalid UUIDs", () => {
    expect(() => studySpaceInputSchema.parse({ name: "hello\u0001world" })).toThrow();
    expect(() => studySpaceIdSchema.parse("not-a-uuid")).toThrow();
    expect(() => studySpaceIdSchema.parse("550e8400-e29b-41d4-a716-446655440000")).not.toThrow();
  });
});

describe("study space services", () => {
  it("returns a not-found error for missing space ids", async () => {
    const db = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({ data: null, error: null })),
          })),
        })),
      })),
    };

    const result = await getStudySpace(db as never, "550e8400-e29b-41d4-a716-446655440000");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(NotFoundError);
    }
  });

  it("enforces the per-user study space cap", async () => {
    const db = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ count: MAX_STUDY_SPACES_PER_USER, error: null })),
        })),
      })),
    };

    const result = await createStudySpace(db as never, "11111111-1111-4111-8111-111111111111", {
      name: "Overflow",
      description: null,
      courseCode: null,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(RateLimitError);
    }
  });
});
