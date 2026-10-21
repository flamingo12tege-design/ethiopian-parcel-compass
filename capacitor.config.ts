import type { CapacitorConfig } from "@capacitor/cli";

// The app renders on the server. The bundled launcher (native-shell/index.html)
// reads app-config.json from GitHub and opens that server, falling back to Lovable.
// See docs/ANDROID_AND_PUSH_SETUP.md ("Remote server switch").
const config: CapacitorConfig = {
  appId: "et.post.tegene",
  appName: "Ethio Post",
  webDir: "native-shell",
  server: {
    androidScheme: "https",
    cleartext: false,
    // Hosts the app may open in-app; add any future server here before building the APK.
    allowNavigation: ["ethiopian-parcel-compass.lovable.app", "*.lovable.app", "*.vercel.app", "raw.githubusercontent.com"],
  },
  plugins: {
    PushNotifications: { presentationOptions: ["badge", "sound", "alert"] },
  },
  android: { allowMixedContent: false },
};

export default config;
