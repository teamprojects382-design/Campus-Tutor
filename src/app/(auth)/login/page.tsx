import Link from "next/link";
import { signIn } from "@/features/auth/actions/auth";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { requireGuest } from "@/features/auth/services/auth";
import { safeRedirectPath } from "@/features/auth/schemas/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string } | undefined>;
}) {
  await requireGuest();
  const params = (await searchParams) ?? {};
  const next = safeRedirectPath(params.next, "/dashboard");

  return (
    <div className="w-full max-w-md space-y-4">
      <AuthForm
        title="Welcome back"
        description="Sign in to continue your study plan."
        submitLabel="Log in"
        action={signIn}
        hiddenFields={[{ name: "next", value: next }]}
        fields={[
          { name: "email", label: "Email address", type: "email", autoComplete: "email", placeholder: "you@university.edu" },
          { name: "password", label: "Password", type: "password", autoComplete: "current-password", placeholder: "Enter your password" },
        ]}
      />
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <Link href="/forgot-password" className="text-sky-700 hover:underline dark:text-sky-400">
          Forgot password?
        </Link>
        <Link href="/signup" className="text-sky-700 hover:underline dark:text-sky-400">
          Create account
        </Link>
      </div>
    </div>
  );
}
