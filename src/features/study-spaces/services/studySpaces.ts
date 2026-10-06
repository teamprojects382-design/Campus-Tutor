import type { SupabaseClient } from "@supabase/supabase-js";

import { AppError, ExternalServiceError, NotFoundError, RateLimitError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { err, ok, type Result } from "@/lib/result";
import { MAX_STUDY_SPACES_PER_USER } from "@/features/study-spaces/constants";
import { studySpaceIdSchema, studySpaceInputSchema, studySpaceRowSchema } from "@/features/study-spaces/schemas/studySpace";
import type { StudySpace, StudySpaceInput } from "@/features/study-spaces/types";

function newRequestId() {
  return crypto.randomUUID();
}

function logFailure(category: string, error: unknown, requestId = newRequestId()) {
  logger.error("study-space-service", { category }, requestId);
  if (error instanceof Error) {
    logger.error("study-space-service-error", { category, errorName: error.name }, requestId);
  }
}

export async function listStudySpaces(db: SupabaseClient): Promise<Result<StudySpace[], AppError>> {
  const requestId = newRequestId();

  try {
    const { data, error } = await db.from("study_spaces").select("*").order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return ok((data ?? []).map((row) => studySpaceRowSchema.parse(row)));
  } catch (error) {
    logFailure("listStudySpaces", error, requestId);
    return err(new ExternalServiceError("Unable to load study spaces.", "We could not load your study spaces right now."));
  }
}

export async function getStudySpace(db: SupabaseClient, id: string): Promise<Result<StudySpace, AppError>> {
  const requestId = newRequestId();
  const parsedId = studySpaceIdSchema.safeParse(id);

  if (!parsedId.success) {
    return err(new ValidationError("Invalid study space id.", "The requested study space could not be found."));
  }

  try {
    const { data, error } = await db.from("study_spaces").select("*").eq("id", parsedId.data).maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return err(new NotFoundError("Study space not found.", "The requested study space could not be found."));
    }

    return ok(studySpaceRowSchema.parse(data));
  } catch (error) {
    logFailure("getStudySpace", error, requestId);
    return err(new ExternalServiceError("Unable to load the study space.", "We could not load this study space right now."));
  }
}

export async function createStudySpace(
  db: SupabaseClient,
  userId: string,
  input: StudySpaceInput,
): Promise<Result<StudySpace, AppError>> {
  const requestId = newRequestId();
  const userValidation = studySpaceIdSchema.safeParse(userId);
  const parsedInput = studySpaceInputSchema.safeParse(input);

  if (!userValidation.success) {
    return err(new ValidationError("Invalid user context.", "Please sign in again and try again."));
  }

  if (!parsedInput.success) {
    return err(new ValidationError("Invalid study space details.", "Please review the study space details and try again."));
  }

  try {
    const { count, error: countError } = await db
      .from("study_spaces")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userValidation.data);

    if (countError) {
      throw countError;
    }

    if (typeof count === "number" && count >= MAX_STUDY_SPACES_PER_USER) {
      return err(new RateLimitError("Study space limit reached.", "You have reached the maximum number of study spaces for your account."));
    }

    const payload = {
      user_id: userValidation.data,
      name: parsedInput.data.name,
      description: parsedInput.data.description,
      course_code: parsedInput.data.courseCode,
    };

    const { data, error } = await db.from("study_spaces").insert(payload).select("*").single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("No study-space row returned after insert.");
    }

    return ok(studySpaceRowSchema.parse(data));
  } catch (error) {
    logFailure("createStudySpace", error, requestId);
    return err(new ExternalServiceError("Unable to create the study space.", "We could not create this study space right now."));
  }
}

export async function updateStudySpace(
  db: SupabaseClient,
  id: string,
  input: StudySpaceInput,
): Promise<Result<StudySpace, AppError>> {
  const requestId = newRequestId();
  const parsedId = studySpaceIdSchema.safeParse(id);
  const parsedInput = studySpaceInputSchema.safeParse(input);

  if (!parsedId.success) {
    return err(new ValidationError("Invalid study space id.", "The requested study space could not be found."));
  }

  if (!parsedInput.success) {
    return err(new ValidationError("Invalid study space details.", "Please review the study space details and try again."));
  }

  try {
    const payload = {
      name: parsedInput.data.name,
      description: parsedInput.data.description,
      course_code: parsedInput.data.courseCode,
    };

    const { data, error } = await db.from("study_spaces").update(payload).eq("id", parsedId.data).select("*");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return err(new NotFoundError("Study space not found.", "The requested study space could not be found."));
    }

    return ok(studySpaceRowSchema.parse(data[0]));
  } catch (error) {
    logFailure("updateStudySpace", error, requestId);
    return err(new ExternalServiceError("Unable to update the study space.", "We could not update this study space right now."));
  }
}

export async function deleteStudySpace(db: SupabaseClient, id: string): Promise<Result<boolean, AppError>> {
  const requestId = newRequestId();
  const parsedId = studySpaceIdSchema.safeParse(id);

  if (!parsedId.success) {
    return err(new ValidationError("Invalid study space id.", "The requested study space could not be found."));
  }

  try {
    const { data, error } = await db.from("study_spaces").delete().eq("id", parsedId.data).select("id");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return err(new NotFoundError("Study space not found.", "The requested study space could not be found."));
    }

    return ok(true);
  } catch (error) {
    logFailure("deleteStudySpace", error, requestId);
    return err(new ExternalServiceError("Unable to delete the study space.", "We could not delete this study space right now."));
  }
}
