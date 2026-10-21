import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Screen, PageHeader, PrimaryButton } from "@/components/app/shell";
import { supabase } from "@/integrations/supabase/client";
import { PasswordInput } from "./auth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set new password — Ethio Post" },
      { name: "description", content: "Choose a new password for your Ethio Post account." },
      { property: "og:title", content: "Set new password — Ethio Post" },
      { property: "og:description", content: "Choose a new password for your Ethio Post account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("At least 8 characters"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated.");
    navigate({ to: "/" });
  };

  return (
    <Screen nav={false}>
      <PageHeader title="New password" />
      <form onSubmit={submit} className="space-y-4 px-5 pt-2">
        <div>
          <label htmlFor="new-password" className="mb-1.5 block text-xs font-semibold">New password</label>
          <PasswordInput id="new-password" value={password} onChange={setPassword} autoComplete="new-password" />
        </div>
        <PrimaryButton type="submit" disabled={busy}>{busy ? "Please wait…" : "Save password"}</PrimaryButton>
      </form>
    </Screen>
  );
}
