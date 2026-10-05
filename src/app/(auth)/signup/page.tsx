import { signUp } from "@/features/auth/actions/auth";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { requireGuest } from "@/features/auth/services/auth";

export default async function SignUpPage() {
  await requireGuest();

  return (
    <AuthForm
      title="Create your account"
      description="Join CampusTutor to keep your revision plan in one calm, focused place."
      submitLabel="Create account"
      action={signUp}
      fields={[
        { name: "full_name", label: "Full name", type: "text", autoComplete: "name", placeholder: "Alicia Chen" },
        { name: "email", label: "Email address", type: "email", autoComplete: "email", placeholder: "you@university.edu" },
        { name: "password", label: "Password", type: "password", autoComplete: "new-password", placeholder: "At least 8 characters" },
      ]}
    />
  );
}
