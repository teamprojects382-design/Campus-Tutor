import { redirect } from "next/navigation";
import { updatePassword } from "@/features/auth/actions/auth";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { getCurrentUser } from "@/features/auth/services/auth";

export default async function UpdatePasswordPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=%2Fupdate-password");
  }

  return (
    <AuthForm
      title="Choose a new password"
      description="Update your password to continue."
      submitLabel="Save password"
      action={updatePassword}
      fields={[{ name: "password", label: "New password", type: "password", autoComplete: "new-password", placeholder: "At least 8 characters" }]}
    />
  );
}
