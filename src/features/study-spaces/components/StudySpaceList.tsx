import Link from "next/link";

import type { StudySpace } from "@/features/study-spaces/types";

function getExcerpt(value: string | null) {
  if (!value) {
    return "No description yet.";
  }

  if (value.length <= 120) {
    return value;
  }

  return `${value.slice(0, 117).trim()}...`;
}

export function StudySpaceList({ items }: { items: StudySpace[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/70">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">No study spaces yet</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Start by creating a study space for your course, notes, and materials.
        </p>
        <Link
          href="/study-spaces/new"
          className="mt-5 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
        >
          Create study space
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((studySpace) => (
        <Link
          key={studySpace.id}
          href={`/study-spaces/${studySpace.id}`}
          className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{studySpace.name}</h2>
              {studySpace.courseCode ? (
                <p className="mt-1 text-sm font-medium text-sky-700 dark:text-sky-300">{studySpace.courseCode}</p>
              ) : null}
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{getExcerpt(studySpace.description)}</p>
        </Link>
      ))}
    </div>
  );
}
