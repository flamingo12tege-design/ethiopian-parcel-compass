import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Screen, PageHeader, PrimaryButton, OutlineButton, BrandMark, inputClass } from "@/components/app/shell";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

const safePath = (p?: string) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "/");

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined }),
  head: () => ({
    meta: [
      { title: "Sign in — Ethiopian Postal Service" },
      { name: "description", content: "Sign in to book parcels and receive status notifications." },
      { property: "og:title", content: "Sign in — Ethiopian Postal Service" },
      { property: "og:description", content: "Sign in to book parcels and receive status notifications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
  name: z.string().trim().max(80).optional(),
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      const target = safePath(redirect ?? sessionStorage.getItem("auth_redirect") ?? undefined);
      sessionStorage.removeItem("auth_redirect");
      navigate({ to: target });
    }
  }, [user, redirect, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse({ email, password, name });
    if (!r.success) {
      toast.error(r.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        if (!data.session) toast.success("Check your email to confirm your account.");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    sessionStorage.setItem("auth_redirect", safePath(redirect));
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (res.error) toast.error(res.error.message);
  };

  return (
    <Screen nav={false}>
      <PageHeader title={mode === "in" ? "Sign in" : "Create account"} />
      <main className="space-y-5 px-5 pb-8">
        <div className="flex justify-center py-2">
          <BrandMark size="lg" />
        </div>
        <form onSubmit={submit} className="space-y-3">
          {mode === "up" && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" className={inputClass} />}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" className={inputClass} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete={mode === "in" ? "current-password" : "new-password"} className={inputClass} />
          <PrimaryButton type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</PrimaryButton>
        </form>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>
        <OutlineButton onClick={google}>Continue with Google</OutlineButton>
        <p className="text-center text-sm text-muted-foreground">
          {mode === "in" ? "New here?" : "Already have an account?"}{" "}
          <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="font-semibold text-primary">
            {mode === "in" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </main>
    </Screen>
  );
}
