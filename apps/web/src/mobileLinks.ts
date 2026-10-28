export type DeviceInfo = {
  userAgent: string;
  platform?: string;
  maxTouchPoints?: number;
};
export type DeviceKind = "desktop" | "ios" | "android";

export function getDeviceKind(device: DeviceInfo): DeviceKind {
  if (/Android/i.test(device.userAgent)) return "android";
  if (
    /iPhone|iPad|iPod/i.test(device.userAgent) ||
    (device.platform === "MacIntel" && (device.maxTouchPoints ?? 0) > 1)
  )
    return "ios";
  return "desktop";
}

// Packages verified against each site's assetlinks.json, except YouTube,
// whose package is published in its official Google Play listing.
const androidApps: Record<string, string> = {
  "github.com": "com.github.android",
  "chatgpt.com": "com.openai.chatgpt",
  "www.notion.so": "notion.id",
  "www.bilibili.com": "tv.danmaku.bili",
  "www.youtube.com": "com.google.android.youtube",
  "mail.google.com": "com.google.android.gm",
  "www.zhihu.com": "com.zhihu.android",
  "translate.google.com": "com.google.android.apps.translate",
};

export function getBookmarkLink(webUrl: string, device: DeviceInfo) {
  const kind = getDeviceKind(device);
  if (kind === "desktop") return { href: webUrl, target: "_blank" as const };
  // Current-tab HTTPS preserves iOS Universal Links and Android App Links.
  const webLink = { href: webUrl, target: "_self" as const };
  if (kind !== "android") return webLink;
  const chromium = /(?:Chrome|Chromium|EdgA|SamsungBrowser|OPR)\//i.test(
    device.userAgent,
  );
  const embedded = /; wv\)|\bwv\b|MicroMessenger|FBAN|FBAV|Instagram/i.test(
    device.userAgent,
  );
  if (!chromium || embedded) return webLink;
  let url: URL;
  try {
    url = new URL(webUrl);
  } catch {
    return webLink;
  }
  if (url.protocol !== "https:" || url.username || url.password) return webLink;
  const app = Object.hasOwn(androidApps, url.hostname)
    ? androidApps[url.hostname]
    : undefined;
  if (!app) return webLink;
  // A fragment may have application-specific routing semantics; retain the
  // original HTTPS App Link instead of mixing it with Intent metadata.
  if (url.hash) return webLink;
  const resource = url.href.slice("https://".length);
  return {
    href: `intent://${resource}#Intent;scheme=https;package=${app};S.browser_fallback_url=${encodeURIComponent(webUrl)};end`,
    target: "_self" as const,
  };
}
