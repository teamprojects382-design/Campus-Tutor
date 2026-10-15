import { z } from "zod";

const controlCharPattern = /[\u0000-\u001F\u007F]/;

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const normalizeOptionalString = (value: unknown) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

const optionalTrimmedStringSchema = (maxLength: number, fieldName: string) =>
  z.preprocess(
    (value) => normalizeOptionalString(value),
    z.union([
      z
        .string()
        .transform((item) => normalizeWhitespace(item))
        .refine((item) => item.length <= maxLength, {
          message: `${fieldName} must be ${maxLength} characters or fewer.`,
        })
        .refine((item) => !controlCharPattern.test(item), {
          message: `${fieldName} contains unsupported control characters.`,
        }),
      z.literal(null),
    ]),
  );

export const studySpaceInputSchema = z.object({
  name: z
    .string()
    .transform((value) => normalizeWhitespace(value))
    .refine((value) => value.length >= 1 && value.length <= 100, {
      message: "Name must be between 1 and 100 characters.",
    })
    .refine((value) => !controlCharPattern.test(value), {
      message: "Name contains unsupported control characters.",
    }),
  courseCode: optionalTrimmedStringSchema(20, "Course code") as z.ZodType<string | null>,
  description: optionalTrimmedStringSchema(500, "Description") as z.ZodType<string | null>,
});

export const studySpaceIdSchema = z.string().trim().uuid();

export const studySpaceRowSchema = z
  .object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    name: z.string().min(1).max(100),
    description: z.string().max(500).nullable(),
    course_code: z.string().max(20).nullable(),
    created_at: z.union([z.string(), z.date()]),
    updated_at: z.union([z.string(), z.date()]),
  })
  .transform((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    courseCode: row.course_code,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
