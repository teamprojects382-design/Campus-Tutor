import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteStudySpaceAction, updateStudySpaceFormAction } from "@/features/study-spaces/actions/studySpaces";
import { StudySpaceForm } from "@/features/study-spaces/components/StudySpaceForm";
import { studySpaceIdSchema } from "@/features/study-spaces/schemas/studySpace";
import { getDb, requireUser } from "@/features/study-spaces/server/deps";
import { getStudySpace } from "@/features/study-spaces/services/studySpaces";

export const dynamic = "force-dynamic";

export default async function EditStudySpacePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();

  const { id } = await params;
  const parsedId = studySpaceIdSchema.safeParse(id);

  if (!parsedId.success) {
    notFound();
  }

  const db = await getDb();
  const result = await getStudySpace(db, parsedId.data);

  if (!result.ok) {
    notFound();
  }

  const studySpace = result.value;

  return (
    <section aria-labelledby="edit-study-space-heading" className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Edit</p>
          <h1 id="edit-study-space-heading" className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Update study space
          </h1>
        </div>
        <Link href={`/study-spaces/${studySpace.id}`} className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
          Back to overview
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <StudySpaceForm
          action={updateStudySpaceFormAction}
          submitLabel="Save changes"
          id={studySpace.id}
          initialValues={{
            name: studySpace.name,
            courseCode: studySpace.courseCode,
            description: studySpace.description,
          }}
        />
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
        <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">Danger zone</h2>
        <details className="mt-4">
          <summary className="cursor-pointer list-none text-sm font-medium text-red-800 dark:text-red-200">
            Delete this study space
          </summary>
          <form action={deleteStudySpaceAction} className="mt-4 space-y-4" noValidate>
            <input type="hidden" name="id" value={studySpace.id} />
            <p className="text-sm text-slate-700 dark:text-slate-200">
              Deletes this study space and everything in it. This cannot be undone.
            </p>
            <button
              type="submit"
              className="rounded-md border border-red-300 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              Delete study space
            </button>
          </form>
        </details>
      </div>
    </section>
  );
}
