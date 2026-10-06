import { ConfigContext, ExpoConfig } from "expo/config";

// Two app variants (LL85) so the dev build and the store app can be installed side by side.
// Select with the APP_VARIANT env var; anything other than "development" is production.
const IS_DEV = process.env.APP_VARIANT === "development";

const BASE_ID = "com.rahimi.famfriend";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_DEV ? "FamFriend (Dev)" : "FamFriend",
  slug: "famfriend",
  scheme: IS_DEV ? "famfriend-dev" : "famfriend",
  ios: {
    ...config.ios,
    bundleIdentifier: IS_DEV ? `${BASE_ID}.dev` : BASE_ID,
  },
  android: {
    ...config.android,
    package: IS_DEV ? `${BASE_ID}.dev` : BASE_ID,
  },
});
