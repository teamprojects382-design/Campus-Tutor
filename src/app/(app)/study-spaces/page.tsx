import Link from "next/link";
import { notFound } from "next/navigation";

import { StudySpaceList } from "@/features/study-spaces/components/StudySpaceList";
import { getDb, requireUser } from "@/features/study-spaces/server/deps";
import { listStudySpaces } from "@/features/study-spaces/services/studySpaces";

export const dynamic = "force-dynamic";

export default async function StudySpacesPage() {
  await requireUser();
  const db = await getDb();
  const result = await listStudySpaces(db);

  if (!result.ok) {
    notFound();
  }

  return (
    <section aria-labelledby="study-spaces-heading" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Study spaces</p>
          <h1 id="study-spaces-heading" className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Your courses
          </h1>
        </div>
        <Link
          href="/study-spaces/new"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
        >
          Create study space
        </Link>
      </div>

      <StudySpaceList items={result.value} />
    </section>
  );
}
