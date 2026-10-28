import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { getDesktopAppUrl, attemptDesktopApp } from "../desktopAppLinks";
import { getBookmarkLink } from "../mobileLinks";
import type { Bookmark } from "../bookmarks";

export default function BookmarkLink({
  item,
  children,
}: {
  item: Bookmark;
  children: ReactNode;
}) {
  const device = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
  };
  const link = getBookmarkLink(item.url, device);
  const appUrl = getDesktopAppUrl(item.url, device);
  const pending = useRef<(() => void) | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  useEffect(
    () => () => {
      pending.current?.();
    },
    [],
  );
  return (
    <>
      <a
        href={link.href}
        target={link.target}
        title={item.description || undefined}
        rel="noopener noreferrer"
        onClick={(event) => {
          if (
            !event.ctrlKey &&
            !event.metaKey &&
            !event.shiftKey &&
            !event.altKey
          ) {
            if (appUrl && event.button === 0) {
              event.preventDefault();
              pending.current?.();
              setShowFallback(true);
              let frame: HTMLIFrameElement | undefined;
              const cancel = attemptDesktopApp({
                window,
                document,
                launch: () => {
                  // Keep unsupported/blocked protocol error pages out of the
                  // navigation tab. The browser still controls app permission.
                  frame = document.createElement("iframe");
                  frame.hidden = true;
                  frame.setAttribute("aria-hidden", "true");
                  frame.src = appUrl;
                  document.body.append(frame);
                },
                fallback: () => {
                  frame?.remove();
                  setShowFallback(false);
                  window.location.assign(item.url);
                },
              });
              pending.current = () => {
                cancel();
                frame?.remove();
              };
            }
            return;
          }
          // Modified clicks always retain normal web/new-tab semantics.
          if (link.href !== item.url || link.target !== "_blank") {
            event.preventDefault();
            window.open(item.url, "_blank", "noopener,noreferrer");
          }
        }}
        onAuxClick={(event) => {
          if (event.button === 1 && link.href !== item.url) {
            event.preventDefault();
            window.open(item.url, "_blank", "noopener,noreferrer");
          }
        }}
      >
        {children}
      </a>
      {showFallback && (
        <div className="app-open-notice" role="status">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              pending.current?.();
              setShowFallback(false);
            }}
          >
            打开 {item.name} 网页版
          </a>
          <button
            type="button"
            aria-label="关闭 App 跳转提示"
            onClick={() => {
              pending.current?.();
              setShowFallback(false);
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
