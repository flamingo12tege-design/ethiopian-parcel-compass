import type { CapacitorConfig } from "@capacitor/cli";

// The app renders on the server, so the Android shell loads the published site.
// Replace server.url with your published URL (see docs/ANDROID_AND_PUSH_SETUP.md).
const config: CapacitorConfig = {
  appId: "et.post.tracking.demo",
  appName: "Ethio Post",
  webDir: "public",
  server: {
    url: "https://REPLACE-WITH-YOUR-PUBLISHED-URL.lovable.app",
    cleartext: false,
  },
  plugins: {
    PushNotifications: { presentationOptions: ["badge", "sound", "alert"] },
  },
  android: { allowMixedContent: false },
};

export default config;
