import Link from "next/link";
import { requestPasswordReset } from "@/features/auth/actions/auth";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { requireGuest } from "@/features/auth/services/auth";

export default async function ForgotPasswordPage() {
  await requireGuest();

  return (
    <div className="w-full max-w-md space-y-4">
      <AuthForm
        title="Reset your password"
        description="We will send a secure reset link to your email."
        submitLabel="Send reset link"
        action={requestPasswordReset}
        fields={[{ name: "email", label: "Email address", type: "email", autoComplete: "email", placeholder: "you@university.edu" }]}
      />
      <Link href="/login" className="block text-sm text-sky-700 hover:underline dark:text-sky-400">
        Back to login
      </Link>
    </div>
  );
}
