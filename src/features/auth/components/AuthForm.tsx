"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldConfig = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
};

type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors: Record<string, string>;
};

export function AuthForm({
  title,
  description,
  fields,
  action,
  submitLabel,
  hiddenFields = [],
}: {
  title: string;
  description?: string;
  fields: FieldConfig[];
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  hiddenFields?: Array<{ name: string; value: string }>;
}) {
  const initialState: ActionState = { ok: true, message: "", fieldErrors: {} };
  const [state, formAction, pending] = useActionState(action, initialState);
  const firstErrorRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (state.ok || !state.fieldErrors) {
      return;
    }

    const firstFieldName = Object.keys(state.fieldErrors)[0];
    if (!firstFieldName) {
      return;
    }

    const input = document.querySelector<HTMLInputElement>(`input[name="${CSS.escape(firstFieldName)}"]`);
    if (input) {
      firstErrorRef.current = input;
      input.focus();
    }
  }, [state]);

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">CampusTutor</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{title}</h1>
        {description ? <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p> : null}
      </div>

      {!state.ok ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200" role="alert">
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="space-y-5" noValidate>
        {hiddenFields.map((field) => (
          <input key={field.name} type="hidden" name={field.name} value={field.value} />
        ))}

        {fields.map((field) => {
          const fieldError = state.fieldErrors[field.name];
          const describedBy = fieldError ? `${field.name}-error` : undefined;

          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                name={field.name}
                type={field.type ?? "text"}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                defaultValue={field.defaultValue}
                aria-invalid={Boolean(fieldError)}
                aria-describedby={describedBy}
                className={fieldError ? "border-red-400 focus-visible:ring-red-500" : undefined}
              />
              {fieldError ? (
                <p id={`${field.name}-error`} className="text-sm text-red-700 dark:text-red-300">
                  {fieldError}
                </p>
              ) : null}
            </div>
          );
        })}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Please wait..." : submitLabel}
        </Button>
      </form>
    </div>
  );
}
