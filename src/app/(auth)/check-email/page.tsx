import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">CampusTutor</p>
      <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-50">Check your email</h1>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        We sent a secure link to continue. If it does not arrive soon, please check your spam folder or request another reset.
      </p>
      <Link href="/login" className="mt-6 inline-block text-sm font-medium text-sky-700 hover:underline dark:text-sky-400">
        Return to login
      </Link>
    </div>
  );
}
