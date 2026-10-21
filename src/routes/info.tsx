import { createFileRoute, redirect } from "@tanstack/react-router";

// /info now shows the Claims page.
export const Route = createFileRoute("/info")({
  beforeLoad: () => {
    throw redirect({ to: "/claims", replace: true });
  },
});
