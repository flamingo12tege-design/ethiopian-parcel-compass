# Android app & push notifications setup

## How notifications work

1. A status change is a new row in `tracking_events` (inserted by staff tools, or the labelled demo simulator).
2. A database trigger updates the parcel status and creates one `notifications` row per interested user
   (the booking owner + anyone who tapped "Notify me"). `UNIQUE(user_id, event_id)` makes duplicates impossible.
3. The server dispatcher (`src/lib/push.server.ts`) claims rows with a conditional
   `pending -> sending` update, so concurrent runs never send the same notification twice, then sends via
   Firebase Cloud Messaging and marks each row `sent`, `failed` or `skipped`. Dead device tokens are removed.
4. Dispatch runs immediately after a demo simulation, and can be scheduled for real events via the
   protected endpoint `POST /api/public/push/dispatch` (platform-scheduler bearer auth only).

Without Firebase connected, notifications still appear in the in-app Notifications screen; push is `skipped`.

## Demo data

Parcels `EP123456789ET`, `EP987654321ET`, `EP555000111ET` and all post offices are fictional and flagged
`is_demo`. Simulated events are stored with `is_simulated = true` and shown with a "Simulated" label.
Remove them before going live.

## 1. Connect Firebase Cloud Messaging

- Create a Firebase project, add an Android app with package name `et.post.tegene` (or your own; keep it
  in sync with `capacitor.config.ts`), and download `google-services.json`.
- In Lovable, connect the **Firebase Cloud Messaging** connector (service account). This provides the server
  credentials; no keys go into the code.

## 2. Build the Android app

```bash
git clone <your repo> && cd <repo>
bun install
# set server.url in capacitor.config.ts to your published URL
npx cap add android
cp /path/to/google-services.json android/app/google-services.json
npx cap sync android
npx cap open android   # build & run from Android Studio
```

Android 13+ asks for the notification permission the first time the user signs in or enables
"Parcel status notifications" in Profile.

## 3. Schedule dispatch for real (non-demo) events

Ask Lovable to "schedule the push dispatch endpoint every few minutes", or trigger it from your staff tool
right after inserting a tracking event.

## 4. Going live checklist

- Delete demo parcels/post offices and replace with real data.
- Replace illustrative rates in `src/lib/parcels.ts`.
- Add a staff/admin role for inserting tracking events (currently only possible server-side).
