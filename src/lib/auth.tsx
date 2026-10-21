import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type AuthState = { session: Session | null; loading: boolean };
const AuthContext = createContext<AuthState>({ session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, loading: true });
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;
    let receivedAuthEvent = false;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      receivedAuthEvent = true;
      setState({ session, loading: false });
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event === "SIGNED_OUT") queryClient.clear();
      else queryClient.invalidateQueries();
    });
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (active && !receivedAuthEvent) setState({ session, loading: false });
      })
      .catch(() => {
        if (active && !receivedAuthEvent) setState({ session: null, loading: false });
      });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [router, queryClient]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const { session, loading } = useContext(AuthContext);
  return { session, user: session?.user ?? null, loading };
}
