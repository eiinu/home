import test from "node:test";
import assert from "node:assert/strict";
import { getBookmarkLink, getDeviceKind } from "../src/mobileLinks.ts";
const desktop = {
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Chrome/130.0",
  platform: "MacIntel",
  maxTouchPoints: 0,
};
const android = {
  userAgent:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36",
};
const iphone = {
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile/15E148 Safari/604.1",
};
test("real device detection, including iPad desktop-mode UA", () => {
  assert.equal(getDeviceKind(desktop), "desktop");
  assert.equal(getDeviceKind(android), "android");
  assert.equal(getDeviceKind(iphone), "ios");
  assert.equal(getDeviceKind({ ...desktop, maxTouchPoints: 5 }), "ios");
  assert.equal(
    getDeviceKind({
      userAgent: "Windows Chrome/130.0",
      platform: "Win32",
      maxTouchPoints: 5,
    }),
    "desktop",
  );
});
test("desktop keeps original URL and new-tab navigation", () => {
  const url = "https://www.youtube.com/watch?v=test";
  assert.deepEqual(getBookmarkLink(url, desktop), {
    href: url,
    target: "_blank",
  });
});
test("iOS preserves HTTPS for native Universal Links with web fallback", () => {
  for (const url of [
    "https://www.bilibili.com/",
    "https://www.zhihu.com/question/123",
    "https://vercel.com/",
  ])
    assert.deepEqual(getBookmarkLink(url, iphone), {
      href: url,
      target: "_self",
    });
});
test("Android packages are fixed and each Intent includes the original web fallback", () => {
  const cases = {
    "github.com": "com.github.android",
    "chatgpt.com": "com.openai.chatgpt",
    "www.notion.so": "notion.id",
    "www.bilibili.com": "tv.danmaku.bili",
    "www.youtube.com": "com.google.android.youtube",
    "mail.google.com": "com.google.android.gm",
    "www.zhihu.com": "com.zhihu.android",
    "translate.google.com": "com.google.android.apps.translate",
  };
  for (const [host, app] of Object.entries(cases)) {
    const url = `https://${host}/path?value=%E4%B8%AD%E6%96%87&other=a%3Bb`;
    const link = getBookmarkLink(url, android);
    assert.equal(link.target, "_self");
    assert.ok(link.href.startsWith(`intent://${host}/path?`));
    assert.ok(link.href.includes(`;scheme=https;package=${app};`));
    const fallback = link.href.match(/;S.browser_fallback_url=([^;]+);end$/)[1];
    assert.equal(decodeURIComponent(fallback), url);
  }
});
test("unsupported apps, browser engines, embedded webviews and HTTP retain web navigation", () => {
  for (const url of [
    "https://vercel.com/",
    "https://www.figma.com/",
    "https://www.douban.com/",
    "http://www.youtube.com/",
    "https://www.youtube.com.attacker.example/",
    "https://evil.example/?host=github.com",
    "https://user:password@github.com/",
  ])
    assert.deepEqual(getBookmarkLink(url, android), {
      href: url,
      target: "_self",
    });
  for (const device of [
    { userAgent: "Android Firefox/130.0" },
    { userAgent: android.userAgent + " MicroMessenger/8.0" },
    { userAgent: android.userAgent.replace("Android 14;", "Android 14; wv;") },
  ])
    assert.deepEqual(getBookmarkLink("https://github.com/", device), {
      href: "https://github.com/",
      target: "_self",
    });
});
test("fragments cannot inject Intent metadata and retain original destination", () => {
  for (const url of [
    "https://github.com/#readme",
    "https://github.com/#Intent;scheme=javascript;end",
  ])
    assert.deepEqual(getBookmarkLink(url, android), {
      href: url,
      target: "_self",
    });
});
