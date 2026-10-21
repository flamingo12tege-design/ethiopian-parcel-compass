import { createServerFn } from "@tanstack/react-start";

/**
 * Google's Web OAuth client ID. It is a public identifier (it is shown on Google's
 * sign-in screen anyway), so returning it is safe; the client secret never leaves the server.
 */
export const getGoogleWebClientId = createServerFn({ method: "GET" }).handler(async () => {
  return { webClientId: process.env["GOOGLE_OAUTH_CLIENT_ID"] ?? null };
});
