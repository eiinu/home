import test from "node:test";
import assert from "node:assert/strict";
import { getDesktopAppUrl, attemptDesktopApp } from "../src/desktopAppLinks.ts";
const mac = { userAgent: "Macintosh Chrome/130.0", platform: "MacIntel" };
const win = { userAgent: "Windows NT Chrome/130.0", platform: "Win32" };
test("ChatGPT and Notion desktop home shortcuts use native protocols on Mac and Windows", () => {
  for (const device of [mac, win]) {
    assert.equal(
      getDesktopAppUrl("https://chatgpt.com/", device),
      "chatgpt://",
    );
    for (const host of [
      "notion.so",
      "www.notion.so",
      "notion.com",
      "www.notion.com",
    ])
      assert.equal(
        getDesktopAppUrl(`https://${host}/`, device),
        "notion://www.notion.so/",
      );
  }
});
test("mobile, Linux, unrelated sites and non-home destinations do not use desktop protocols", () => {
  for (const device of [
    { userAgent: "Android Chrome/130.0" },
    { userAgent: "iPhone Safari/18.0" },
    { ...mac, maxTouchPoints: 5 },
    { userAgent: "Linux Chrome/130.0", platform: "Linux x86_64" },
  ])
    assert.equal(getDesktopAppUrl("https://chatgpt.com/", device), null);
  for (const url of [
    "https://github.com/",
    "https://chatgpt.com/c/abc",
    "https://www.notion.so/a-page",
    "https://chatgpt.com/?q=hello",
    "https://chatgpt.com/#section",
    "http://chatgpt.com/",
    "https://chatgpt.com.attacker.example/",
    "https://user:pass@chatgpt.com/",
    "invalid",
  ])
    assert.equal(getDesktopAppUrl(url, mac), null);
});
function fixture() {
  const window = new EventTarget();
  const document = new EventTarget();
  document.visibilityState = "visible";
  let launches = 0,
    fallbacks = 0;
  const options = {
    window,
    document,
    launch: () => {
      launches++;
    },
    fallback: () => {
      fallbacks++;
    },
  };
  return {
    options,
    get launches() {
      return launches;
    },
    get fallbacks() {
      return fallbacks;
    },
  };
}
test("visible page falls back only after the grace period", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const f = fixture();
  attemptDesktopApp(f.options);
  assert.equal(f.launches, 1);
  t.mock.timers.tick(1799);
  assert.equal(f.fallbacks, 0);
  t.mock.timers.tick(1);
  assert.equal(f.fallbacks, 1);
  t.mock.timers.tick(10000);
  assert.equal(f.fallbacks, 1);
});
test("app focus, protocol prompts and page changes stop automatic fallback", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  for (const event of ["blur", "pagehide", "visibilitychange"]) {
    const f = fixture();
    attemptDesktopApp(f.options);
    if (event === "visibilitychange") {
      f.options.document.visibilityState = "hidden";
      f.options.document.dispatchEvent(new Event(event));
    } else f.options.window.dispatchEvent(new Event(event));
    t.mock.timers.tick(2000);
    assert.equal(f.fallbacks, 0, event);
  }
});
test("component cleanup cancels pending fallback and a launch error falls back immediately", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const f = fixture();
  const cancel = attemptDesktopApp(f.options);
  cancel();
  cancel();
  t.mock.timers.tick(2000);
  assert.equal(f.fallbacks, 0);
  const failed = fixture();
  failed.options.launch = () => {
    throw new Error("not supported");
  };
  attemptDesktopApp(failed.options);
  assert.equal(failed.fallbacks, 1);
  t.mock.timers.tick(2000);
  assert.equal(failed.fallbacks, 1);
});
