export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:focus-within:ring-offset-slate-950">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
          Study smarter
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">CampusTutor</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Personalized AI revision support for university study sessions, grounded in your course materials.
        </p>
      </section>
    </main>
  );
}
