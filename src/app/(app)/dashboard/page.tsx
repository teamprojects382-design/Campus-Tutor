import { getMyProfile } from "@/features/users/getMyProfile";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const profile = await getMyProfile();
  const displayName = profile?.full_name ?? "Student";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Dashboard</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
        Welcome, {displayName}
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        Your study workspace is ready for the next phase.
      </p>
    </section>
  );
}
