# Android performance audit and validation

Date: 2026-10-21. Scope: existing TanStack Start web app, Capacitor 8 remote-site Android shell. No framework migration, dependency removal, business-rule changes, native security overrides, or database changes.

## Ranked findings and implemented fixes

1. **High: artificial splash delay.** `src/components/app/splash.tsx` originally waited 1,400 ms before fading and 1,900 ms before removing the overlay, regardless of readiness. The yellow strip pulsed in place rather than travelling. The overlay now follows auth initialization plus router idle state, with only a 200 ms fade. The strip uses a transform-only animation, disabled for reduced-motion preferences. Session-storage failures no longer prevent launch. The splash does not redirect to Home or bypass protected-screen checks.
2. **High: repeated masked tracking reads.** Loader `ensureQueryData` and component `useSuspenseQuery` shared immediately-stale options. `src/lib/parcels.ts` now uses a 30-second freshness window and forwards query cancellation to the masked tracking RPC. The existing Home 30-second polling remains intact. A regression test confirms one RPC call for loader + mounted screen. `src/routes/locator.tsx` likewise uses a five-minute freshness window and cancellation; it does not silently cap office results.
3. **Medium: asynchronous push listeners could leak.** In `src/lib/native-push.tsx`, cleanup was assigned only after asynchronous listener setup, profile lookup and registration. Unmounting earlier left listeners installed. Each handle is now retained/removed individually, including handles resolving after unmount. The effect depends on user ID rather than the changing session user object. This avoids needless listener reinstalls on token refresh. Firebase sending and notification deduplication remain server-side and unchanged.
4. **Medium: auth initialization race and rejection.** `src/lib/auth.tsx` could overwrite a newer auth event with an older `getSession()` result, and an initialization rejection could leave loading true. The initialization result is now guarded against newer events and unmount; rejection releases loading to a signed-out state without exposing protected data. Existing sign-out cache clearing is preserved.
5. **Medium: oversized decorative parcel image.** An 816 × 816 PNG (535,656 bytes) was rendered at 128 px on Home and 176 px on Track. The same illustration now uses a 256 × 256 transparent WebP (6,502 bytes). The original is retained for reversibility, but neither route imports it. The decoded pixel count is approximately 90% smaller. Visual checks confirmed the image loads at both tested viewport sizes.

## Measured before / after

These are **development-browser measurements, not production or Android benchmarks**. Three fresh Chromium contexts per version, 394 × 619 viewport, localhost Vite, no CPU/network throttling. The script observes the server-rendered splash appearing and its DOM removal. Browser, machine and network variability apply; measurements include development module-loading/hydration work.

| Metric | Before | After |
| --- | --- | --- |
| Splash visible, sample 1 | 2,731.3 ms | 1,400.0 ms |
| Splash visible, sample 2 | 2,726.0 ms | 1,405.8 ms |
| Splash visible, sample 3 | 2,784.2 ms | 1,401.7 ms |
| Median splash visible | 2,731.3 ms | 1,401.7 ms |
| Document start to splash removal, median | 2,762.0 ms | 1,458.4 ms |
| Requests observed during launch | 183 | 183 |
| Parcel illustration transfer file size | 535,656 bytes | 6,502 bytes |
| Loader + mounted tracking RPC calls, isolated regression test | default immediately-stale options | 1 call |

No production JS size, interactive-time, FPS, dropped-frame, heap, battery, APK/AAB, native startup, or carrier latency improvement is claimed. The 183 development requests are Vite instrumentation/module requests, not proof of production API traffic. Image-size reduction is a file measurement, not a measured startup contribution.

## Changed files

- `src/components/app/splash.tsx`: readiness-driven dismissal, short fade, safe optional session marker.
- `src/styles.css`: compositor-friendly loader travel and reduced-motion rule.
- `src/lib/auth.tsx`: initialization ordering, rejection and unmount guards.
- `src/lib/native-push.tsx`: cancellation-safe listener disposal and stable user-ID dependency.
- `src/lib/parcels.ts`: masked tracking cache freshness and query cancellation.
- `src/routes/locator.tsx`: office cache freshness/cancellation and missing social metadata.
- `src/assets/parcel.webp`: resized, transparent version of the existing illustration.
- `src/routes/index.tsx`, `src/routes/track.index.tsx`: reference the optimized image with intrinsic dimensions.
- `src/routes/auth.tsx`, `info.tsx`, `notifications.tsx`, `parcel.$trackingNumber.tsx`, `profile.tsx`, `track.$trackingNumber.tsx`: missing `og:type`/`twitter:card` only; no auth or tracking business-logic edits here.
- `src/test/splash.test.tsx`, `auth-lifecycle.test.tsx`, `tracking-cache.test.tsx`, `native-push-lifecycle.test.tsx`: startup and lifecycle regression coverage.
- `AGENTS.md`, `roadmap.md`, this report: durable implementation rules and status.

The concurrently completed calculator task changed `src/routes/calculator.tsx`, introduced `src/lib/postage.ts` and `src/test/postage.test.ts`, and calculates only confirmed Ethiopia rates. It is not presented as a performance optimization.

## Validation actually executed

- `bunx vitest run`: **22 tests passed across eight files**. Covers official-rate examples, tracking parser, recent identifiers, routing, splash readiness/warm-session behavior, auth initialization failure/race, loader-read deduplication, delayed native listener cleanup, stable-user refresh and denied notification permission. Native tests use mocks; they do not establish real FCM delivery.
- Targeted ESLint on changed performance and calculator files: **0 errors, 5 warnings** (existing mixed component/function fast-refresh warnings and the locator's existing memo dependency warning). Formatting errors encountered during checks were resolved. No full-project lint-clean claim.
- Harness preview build log: latest checked entry **build OK**. No manual production build or typecheck was run, per the supervised environment's rules. No production build artifacts were available for size inspection.
- Playwright: repeated Home/Profile/Alerts/Services navigation, warm-session splash not replaying, image natural dimensions, phone and desktop screenshots, calculator EMS 1.5 kg = 845 ETB, live lookup of `RQ602916122MY` displaying Ethiopian Post's delivered result and history. No page errors in the successful run.
- Calculator-specific Playwright checks also confirmed all four supplied EMS/Parcel examples, invalid numeric steps, unconfirmed weight handling and no calculated international charge.
- Authenticated end-to-end checks **blocked**: minting the requesting user's session failed because no app account matches them. Sign in in the preview before repeating profile save, sign-out, refresh and notification checks. No private data or credentials were used in public browser checks.

## Android audit: what exists and what does not

- Installed core, Android, push and CLI packages resolve to Capacitor 8. Native APIs are dynamically imported; no new plugin was added.
- `capacitor.config.ts` still uses a placeholder remote HTTPS URL; `cleartext: false` and `allowMixedContent: false` are preserved.
- There is **no `android/` directory**, manifest, app Gradle config, `google-services.json`, APK or AAB. Therefore sync, Android compilation, installed WebView, real target/min SDK, release shrinker rules, edge-to-edge, back-button, keyboard, notification permission and device lifecycle behavior are not verified.
- Installed Capacitor Android library fallbacks are min SDK 24 and compile/target SDK 36. Those are library defaults, not proof of a generated app's values. Recheck current store requirements against Android/Google Play documentation before release.
- The shell loads the published SSR site rather than a local static export. `public/` is not an application bundle. Do not point `webDir` at imaginary SPA output or replace this architecture as a speculative speed fix. Network-less cold launch needs a deliberate native offline/error experience; none is claimed here.
- No native splash plugin is installed. The web splash fix does not establish a smooth OS launch-screen-to-WebView transition.

## Exact local Android steps

1. Obtain the real published app HTTPS URL and replace only `server.url` in `capacitor.config.ts`. Do not use the preview URL for production. Keep cleartext and mixed-content disabled.
2. On a machine with the Capacitor 8-compatible JDK/Android SDK and Android Studio, run `bun install`, `bunx cap add android`, provide Firebase's matching `android/app/google-services.json`, then `bunx cap sync android`. Follow `docs/ANDROID_AND_PUSH_SETUP.md` for server-side FCM setup. No private server credential belongs in the app.
3. Inspect generated `android/variables.gradle`, `android/app/build.gradle`, manifest and merged manifest before changing them. In the release build type, evaluate `minifyEnabled true` and `shrinkResources true` together with the default optimized ProGuard file and plugin-specific keep rules. Build and test first; no unverified shrinker config was committed here.
4. Run `./gradlew :app:assembleRelease :app:bundleRelease` from `android/`, using local release signing. Inspect APK/AAB size and verify launch, plugin registration and push taps after shrinking. Keep generated plugin files unchanged; check which edits survive `cap sync`.
5. Inspect launcher theme/window background and Android 12+ OS splash behavior before adding any splash plugin. If explicit native splash control is needed, install the matching plugin only then and hide the native splash when the web view is ready—not on a second fixed timer.
6. Verify edge-to-edge/cutouts, status and navigation bar contrast, bottom safe-area spacing, hardware Back, keyboard resize and notification taps on Android 13+ and the minimum supported OS. Do not change compatibility settings solely from these library defaults.
7. Record release-device cold starts (`adb shell am force-stop` then launch), warm starts, process death, background/foreground, offline/slow-network launch, expired-session recovery and denied notification permission. Use Android Studio Profiler, Perfetto and WebView DevTools; Macrobenchmark for repeatable startup/frame measurements. Separate low-end, mid-range and flagship results. Compare with the same build mode, device, network and scenario.

## Remaining high-impact work (prioritized)

1. **Native verification blocker:** actual published URL, generated Android project, Firebase config and real devices are required before assessing OS splash/Back/keyboard, release size, native startup, frame time, battery or memory.
2. **Authenticated verification blocker:** requesting user's signed-in app session is needed for profile saving, session refresh, sign-out and real push-token persistence. Unit tests are not substitutes.
3. **Confirmed existing live-recent mismatch:** after successfully tracking the external parcel above, Home's recent tile still says “Parcel not found” because it only calls the masked database RPC; the detail screen also has a live-carrier fallback. This was observed during navigation and is not caused by the cache change. Unifying these read paths requires preserving masked RPC precedence, bounding carrier calls and deciding a shared refresh policy. It is deliberately reported rather than silently expanding this performance pass into tracking behavior changes.
4. **Scale-dependent lists:** notifications show at most 100 entries and offices load the complete list. No large real dataset was available, so paging/virtualization was not introduced blindly. Benchmark representative populated accounts first, then add paging without dropping access to older entries.
5. **Asset/font follow-up:** logo is a managed 296,554-byte PNG, map ~118 KB, pattern ~81 KB; Google Fonts load two families with `display=swap`. No logo replacement, speculative font deletion or dependency removal was made. Measure production network/LCP and decode work before further changes.
6. **Production bundle analysis:** inspect the harness's production artifacts when available. Automatic TanStack splitting is already enabled; route components are not exported. No new bundler/dependency/plugin was introduced without evidence. Run full lint/typecheck in local CI and address existing warnings independently if desired.

This is a performance/reliability audit, not a security certification; no claim of an independently verified secure app is made.