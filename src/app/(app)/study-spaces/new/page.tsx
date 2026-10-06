import { StudySpaceForm } from "@/features/study-spaces/components/StudySpaceForm";
import { createStudySpaceFormAction } from "@/features/study-spaces/actions/studySpaces";
import { requireUser } from "@/features/study-spaces/server/deps";

export default async function NewStudySpacePage() {
  await requireUser();

  return (
    <section aria-labelledby="new-study-space-heading" className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">New study space</p>
        <h1 id="new-study-space-heading" className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Create a study space
        </h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <StudySpaceForm action={createStudySpaceFormAction} submitLabel="Create study space" />
      </div>
    </section>
  );
}
