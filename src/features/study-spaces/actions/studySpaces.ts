"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createStudySpace, deleteStudySpace, updateStudySpace } from "@/features/study-spaces/services/studySpaces";
import { studySpaceIdSchema, studySpaceInputSchema } from "@/features/study-spaces/schemas/studySpace";
import { getDb, requireUser } from "@/features/study-spaces/server/deps";

export type StudySpaceActionState = {
  ok: boolean;
  message: string;
  fieldErrors: Partial<Record<"name" | "courseCode" | "description", string>>;
};

function extractFieldErrors(error: z.ZodError) {
  return error.issues.reduce<Partial<Record<string, string>>>((acc, issue) => {
    const key = issue.path[0];
    if (typeof key === "string") {
      acc[key] = issue.message;
    }
    return acc;
  }, {});
}

export async function createStudySpaceAction(formData: FormData): Promise<StudySpaceActionState | void> {
  const user = await requireUser();
  const payload = {
    name: String(formData.get("name") ?? ""),
    courseCode: formData.get("courseCode") ?? undefined,
    description: formData.get("description") ?? undefined,
  };

  const parsed = studySpaceInputSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the study space details and try again.",
      fieldErrors: extractFieldErrors(parsed.error),
    };
  }

  const result = await createStudySpace(await getDb(), user.id, parsed.data);
  if (!result.ok) {
    return {
      ok: false,
      message: result.error.safeMessage,
      fieldErrors: {},
    };
  }

  revalidatePath("/study-spaces");
  redirect(`/study-spaces/${result.value.id}`);
}

export async function updateStudySpaceAction(formData: FormData): Promise<StudySpaceActionState | void> {
  await requireUser();
  const idInput = String(formData.get("id") ?? "");
  const parsedId = studySpaceIdSchema.safeParse(idInput);

  if (!parsedId.success) {
    return {
      ok: false,
      message: "The requested study space could not be found.",
      fieldErrors: {},
    };
  }

  const payload = {
    name: String(formData.get("name") ?? ""),
    courseCode: formData.get("courseCode") ?? undefined,
    description: formData.get("description") ?? undefined,
  };

  const parsed = studySpaceInputSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the study space details and try again.",
      fieldErrors: extractFieldErrors(parsed.error),
    };
  }

  const result = await updateStudySpace(await getDb(), parsedId.data, parsed.data);
  if (!result.ok) {
    return {
      ok: false,
      message: result.error.safeMessage,
      fieldErrors: {},
    };
  }

  revalidatePath("/study-spaces");
  revalidatePath(`/study-spaces/${parsedId.data}`);
  redirect(`/study-spaces/${parsedId.data}`);
}

export async function deleteStudySpaceAction(formData: FormData): Promise<void> {
  await requireUser();
  const idInput = String(formData.get("id") ?? "");
  const parsedId = studySpaceIdSchema.safeParse(idInput);

  if (!parsedId.success) {
    redirect("/study-spaces");
  }

  const result = await deleteStudySpace(await getDb(), parsedId.data);
  if (!result.ok) {
    redirect("/study-spaces");
  }

  revalidatePath("/study-spaces");
  redirect("/study-spaces");
}

export async function createStudySpaceFormAction(
  _prevState: StudySpaceActionState,
  formData: FormData,
): Promise<StudySpaceActionState> {
  const result = await createStudySpaceAction(formData);
  return result && typeof result === "object" && "ok" in result ? result : { ok: true, message: "", fieldErrors: {} };
}

export async function updateStudySpaceFormAction(
  _prevState: StudySpaceActionState,
  formData: FormData,
): Promise<StudySpaceActionState> {
  const result = await updateStudySpaceAction(formData);
  return result && typeof result === "object" && "ok" in result ? result : { ok: true, message: "", fieldErrors: {} };
}
