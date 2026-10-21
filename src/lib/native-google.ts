import { supabase } from "@/integrations/supabase/client";
import { getGoogleWebClientId } from "@/lib/google-config.functions";

let initialized: Promise<void> | null = null;

async function sha256Hex(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Android-only Google sign-in using the phone's built-in account picker
 * (no browser page, no web address shown). The Google ID token is exchanged
 * for an app session; a hashed nonce protects against token replay.
 */
export async function nativeGoogleSignIn() {
  const { SocialLogin } = await import("@capgo/capacitor-social-login");
  if (!initialized) {
    initialized = (async () => {
      const { webClientId } = await getGoogleWebClientId();
      if (!webClientId) throw new Error("Google sign-in is not configured yet.");
      await SocialLogin.initialize({ google: { webClientId, mode: "online" } });
    })().catch((e) => {
      initialized = null;
      throw e;
    });
  }
  await initialized;

  const rawNonce = crypto.randomUUID() + crypto.randomUUID();
  const res = await SocialLogin.login({
    provider: "google",
    options: { scopes: ["email", "profile"], nonce: await sha256Hex(rawNonce) },
  });
  const result = res.result as { idToken?: string | null };
  if (!result.idToken) throw new Error("Google did not return a sign-in token.");

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: result.idToken,
    nonce: rawNonce,
  });
  if (error) throw error;
}
