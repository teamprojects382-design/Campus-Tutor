"use client";

import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type StudySpaceFormState = {
  ok: boolean;
  message: string;
  fieldErrors: Partial<Record<"name" | "courseCode" | "description", string>>;
};

type StudySpaceFormProps = {
  action: (prevState: StudySpaceFormState, formData: FormData) => Promise<StudySpaceFormState>;
  submitLabel: string;
  initialValues?: {
    name?: string;
    courseCode?: string | null;
    description?: string | null;
  };
  id?: string;
  submitDisabled?: boolean;
};

const initialState: StudySpaceFormState = {
  ok: true,
  message: "",
  fieldErrors: {},
};

export function StudySpaceForm({
  action,
  submitLabel,
  initialValues,
  id,
  submitDisabled = false,
}: StudySpaceFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    const firstError = Object.entries(state.fieldErrors).find(([, value]) => Boolean(value))?.[0];
    const field = firstError ? document.getElementById(firstError) : null;
    if (field instanceof HTMLElement) {
      field.focus();
    }
  }, [state.fieldErrors]);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {id ? <input type="hidden" name="id" value={id} /> : null}

      {state.message ? (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-900">
          Name
        </label>
        <Input
          id="name"
          name="name"
          defaultValue={initialValues?.name ?? ""}
          autoComplete="off"
          aria-invalid={Boolean(state.fieldErrors.name)}
          aria-describedby={state.fieldErrors.name ? "name-error" : undefined}
          className={state.fieldErrors.name ? "border-red-400" : ""}
        />
        {state.fieldErrors.name ? (
          <p id="name-error" className="text-sm text-red-700">
            {state.fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="courseCode" className="text-sm font-medium text-slate-900">
          Course code
        </label>
        <Input
          id="courseCode"
          name="courseCode"
          defaultValue={initialValues?.courseCode ?? ""}
          autoComplete="off"
          aria-invalid={Boolean(state.fieldErrors.courseCode)}
          aria-describedby={state.fieldErrors.courseCode ? "courseCode-error" : undefined}
          className={state.fieldErrors.courseCode ? "border-red-400" : ""}
        />
        {state.fieldErrors.courseCode ? (
          <p id="courseCode-error" className="text-sm text-red-700">
            {state.fieldErrors.courseCode}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-slate-900">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialValues?.description ?? ""}
          autoComplete="off"
          aria-invalid={Boolean(state.fieldErrors.description)}
          aria-describedby={state.fieldErrors.description ? "description-error" : undefined}
          className={state.fieldErrors.description ? "border-red-400" : ""}
        />
        {state.fieldErrors.description ? (
          <p id="description-error" className="text-sm text-red-700">
            {state.fieldErrors.description}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4 pt-2">
        <Button type="submit" disabled={isPending || submitDisabled} className="w-full sm:w-auto">
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
