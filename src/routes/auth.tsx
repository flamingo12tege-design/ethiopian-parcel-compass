import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { Screen, PrimaryButton, OutlineButton, BrandMark, inputClass } from "@/components/app/shell";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

const safePath = (p?: string) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "/");

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined }),
  head: () => ({
    meta: [
      { title: "Sign in — Ethio Post" },
      { name: "description", content: "Sign in to book parcels and receive status notifications." },
      { property: "og:title", content: "Sign in — Ethio Post" },
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

const labelClass = "mb-1.5 block text-xs font-semibold text-foreground";

export function PasswordInput({ value, onChange, autoComplete, id }: { value: string; onChange: (v: string) => void; autoComplete: string; id: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} className={`${inputClass} pr-12`} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
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
    if (mode === "forgot") {
      const r = z.string().trim().email("Enter a valid email").safeParse(email);
      if (!r.success) { toast.error(r.error.issues[0]?.message); return; }
      setBusy(true);
      const { error } = await supabase.auth.resetPasswordForEmail(r.data, { redirectTo: `${window.location.origin}/reset-password` });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      toast.success("If that email has an account, a reset link is on its way.");
      setMode("in");
      return;
    }
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

  const title = mode === "in" ? "Welcome back" : mode === "up" ? "Create account" : "Reset password";

  return (
    <Screen nav={false}>
      <div className="pt-safe px-2 pt-2">
        <button
          aria-label="Back"
          onClick={() => (mode === "forgot" ? setMode("in") : window.history.length > 1 ? router.history.back() : router.navigate({ to: "/" }))}
          className="grid h-11 w-11 place-items-center rounded-full text-foreground hover:bg-accent"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>
      <main className="space-y-6 px-5 pb-8">
        <div className="flex flex-col items-center gap-4 pt-2 pb-4">
          <BrandMark size="lg" />
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {mode === "forgot" && <p className="text-center text-sm text-muted-foreground">Enter your email and we'll send you a link to set a new password.</p>}
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === "up" && (
            <div>
              <label htmlFor="name" className={labelClass}>Full name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputClass} />
            </div>
          )}
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={inputClass} />
          </div>
          {mode !== "forgot" && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-foreground">Password</label>
                {mode === "in" && (
                  <button type="button" onClick={() => setMode("forgot")} className="py-1 text-xs font-semibold text-primary">
                    Forgot password?
                  </button>
                )}
              </div>
              <PasswordInput id="password" value={password} onChange={setPassword} autoComplete={mode === "in" ? "current-password" : "new-password"} />
            </div>
          )}
          <PrimaryButton type="submit" disabled={busy}>
            {busy ? "Please wait…" : mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Send reset link"}
          </PrimaryButton>
        </form>
        {mode !== "forgot" && (
          <>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-muted-foreground/30" /> or <span className="h-px flex-1 bg-muted-foreground/30" />
            </div>
            <OutlineButton onClick={google} className="border-muted-foreground/40 text-foreground">
              <span className="inline-flex items-center justify-center gap-2">
                <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
                </svg>
                Continue with Google
              </span>
            </OutlineButton>
            <p className="text-center text-sm text-muted-foreground">
              {mode === "in" ? "New here?" : "Already have an account?"}{" "}
              <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="font-bold text-primary underline-offset-2 hover:underline">
                {mode === "in" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </main>
    </Screen>
  );
}
