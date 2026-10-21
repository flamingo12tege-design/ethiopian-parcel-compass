<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Mobile-first single column (`Screen` in src/components/app/shell.tsx) wraps every page; reuse it for consistent header/bottom nav.
- Mount BottomNav once in the root layout, hidden on auth; Screen reserves its space, and resolved location drives active states so pending navigation cannot remount or shift it.
- Public parcel lookup goes only through the `track_parcel` SQL function; it masks contact data so tracking numbers don't leak PII.
- Status changes are inserted as `tracking_events`; a DB trigger updates parcel status and fans out deduped notifications (UNIQUE user_id,event_id).
- Push sending lives in src/lib/push.server.ts and claims rows pending->sending atomically; never send FCM from the client.
- Demo records are flagged `is_demo` / `is_simulated` and must always be labelled in the UI.
- Android uses Capacitor loading the published URL (SSR app); setup in docs/ANDROID_AND_PUSH_SETUP.md.
- Recent tracking stores only successful identifiers on the device; Home reads the masked RPC first and uses the shared five-minute live-carrier query only after a successful empty RPC result, never storing contact details locally.
- Real (non-demo) tracking numbers not in our database are looked up live server-side (src/lib/live-tracking.server.ts: Ethiopian Post site, then Cainiao fallback); never call those sites from the browser (CORS + scraping belongs on the server).
- Calculator pricing uses the isolated, tested lookup in `src/lib/postage.ts`, separate from legacy shipping estimates, so missing tariffs cannot silently become invented prices.
- The web splash follows auth initialization and router readiness, not a minimum launch delay; protected content keeps its own authentication checks.
- Native push listeners are keyed by user ID and individually cleaned up even if asynchronous setup finishes after unmount, preventing duplicate handlers on session refresh.
