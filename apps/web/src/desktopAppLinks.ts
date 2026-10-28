import { getDeviceKind } from "./mobileLinks.ts";
import type { DeviceInfo } from "./mobileLinks.ts";

export function getDesktopAppUrl(
  webUrl: string,
  device: DeviceInfo,
): string | null {
  if (getDeviceKind(device) !== "desktop") return null;
  const supportedSystem = /Mac|Win/i.test(device.platform || device.userAgent);
  if (!supportedSystem) return null;
  let url: URL;
  try {
    url = new URL(webUrl);
  } catch {
    return null;
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.hash ||
    url.search
  )
    return null;
  // These shortcuts open the app's home. Do not discard paths from saved pages.
  if (url.pathname !== "/") return null;
  if (url.hostname === "chatgpt.com") return "chatgpt://";
  if (
    ["www.notion.so", "notion.so", "www.notion.com", "notion.com"].includes(
      url.hostname,
    )
  )
    return "notion://www.notion.so/";
  return null;
}

type LaunchOptions = {
  window: Pick<Window, "addEventListener" | "removeEventListener">;
  document: Pick<
    Document,
    "addEventListener" | "removeEventListener" | "visibilityState"
  >;
  launch: () => void;
  fallback: () => void;
};

// Browsers cannot reliably detect installation. Stop the automatic fallback if
// focus leaves for an app or a protocol prompt; the UI keeps an explicit web link.
export function attemptDesktopApp(options: LaunchOptions): () => void {
  let active = true;
  const cancel = () => {
    if (!active) return;
    active = false;
    clearTimeout(timer);
    options.window.removeEventListener("blur", cancel);
    options.window.removeEventListener("pagehide", cancel);
    options.document.removeEventListener("visibilitychange", visibilityChanged);
  };
  const visibilityChanged = () => {
    if (options.document.visibilityState === "hidden") cancel();
  };
  options.window.addEventListener("blur", cancel);
  options.window.addEventListener("pagehide", cancel);
  options.document.addEventListener("visibilitychange", visibilityChanged);
  const timer = setTimeout(() => {
    const visible = options.document.visibilityState !== "hidden";
    cancel();
    if (visible) options.fallback();
  }, 1800);
  try {
    options.launch();
  } catch {
    cancel();
    options.fallback();
  }
  return cancel;
}
