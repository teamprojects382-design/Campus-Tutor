import { notFound } from "next/navigation";

import { getDb, requireUser } from "@/features/study-spaces/server/deps";
import { getStudySpace } from "@/features/study-spaces/services/studySpaces";
import { studySpaceIdSchema } from "@/features/study-spaces/schemas/studySpace";

export const dynamic = "force-dynamic";

export default async function StudySpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    <section aria-labelledby="study-space-overview-heading" className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Overview</p>
        <h1 id="study-space-overview-heading" className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {studySpace.name}
        </h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {studySpace.courseCode ? (
          <p className="text-base font-medium text-sky-700 dark:text-sky-300">{studySpace.courseCode}</p>
        ) : null}

        <div className="mt-4 space-y-4">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-slate-700 dark:text-slate-200">
              {studySpace.description ?? "No description yet."}
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/60">
            <p className="text-base font-medium text-slate-800 dark:text-slate-100">Materials will arrive in a later phase.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
