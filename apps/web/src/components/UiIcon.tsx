import type { ReactNode } from "react";

const paths = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </>
  ),
  moon: <path d="M20.5 13.5A9 9 0 0 1 10.5 3a9 9 0 1 0 10 10.5Z" />,
  tools: (
    <>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18m-12-2v4m6-4v4" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  arrow: <path d="M6 18 18 6M6 6h12v12" />,
  back: <path d="m12 5-7 7 7 7M5 12h15" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
  code: (
    <>
      <path d="M8 7 3 12 8 17m8-10 5 5-5 5M14 3l-4 18" />
    </>
  ),
  chat: (
    <path d="M6 4h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-6 3V7a3 3 0 0 1 3-3Zm2 5h8m-8 4h5" />
  ),
  note: (
    <>
      <rect x="5" y="3" width="15" height="18" rx="2" />
      <path d="M8 3v18M3 7h4m-4 5h4m-4 5h4m5-9h5m-5 4h5m-5 4h3" />
    </>
  ),
  pen: (
    <>
      <path d="m4 16 11-11a2.8 2.8 0 0 1 4 4L8 20l-5 1 1-5Zm9-9 4 4M4 16l4 4M14 21h7" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="m10 8 5 3-5 3V8Zm-2 14h8m-4-4v4" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8 6 4-6 4V8Z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  cloud: (
    <>
      <path d="M7 18H6a4 4 0 0 1-.5-8A6.5 6.5 0 0 1 18 8a5 5 0 0 1 0 10h-1m-5 3V11m-4 4 4-4 4 4" />
    </>
  ),
  article: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 11h8m-8 4h4m-4 3h8" />
    </>
  ),
  question: (
    <>
      <path d="M8 18H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-5l-5 3v-3" />
      <path d="M9.5 8a2.5 2.5 0 1 1 4 2c-1 .5-1.5 1-1.5 2m0 3h.01" />
    </>
  ),
  books: (
    <>
      <rect x="3" y="4" width="5" height="16" rx="1" />
      <rect x="8" y="4" width="5" height="16" rx="1" />
      <path d="m14 5 4-1 4 15-4 1-4-15ZM3 8h10M3 17h10" />
    </>
  ),
  language: (
    <>
      <path d="M3 6h10M8 3v3m-3 4c2 3 4 4 7 5M11 6c0 5-3 8-8 10m11 4 4-10 4 10m-6.5-4h5" />
    </>
  ),
  link: (
    <>
      <path d="m9 15 6-6m-5-3 2-2a4.2 4.2 0 0 1 6 6l-2 2m-2 6-2 2a4.2 4.2 0 0 1-6-6l2-2" />
    </>
  ),
  brackets: <path d="M9 3H6v7l-3 2 3 2v7h3m6-18h3v7l3 2-3 2v7h-3" />,
  regex: (
    <>
      <path d="M14 4v10m-4-8 8 6m-8 0 8-6" />
      <circle cx="6" cy="18" r="1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  stream: (
    <>
      <path d="M4 6h12m-2-3 3 3-3 3M4 12h16M8 18h12m-14-3-3 3 3 3" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="5" width="14" height="16" rx="2" />
      <rect x="8" y="2" width="8" height="5" rx="1" />
      <path d="M9 12h6m-6 4h4" />
    </>
  ),
  border: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 9V8h1m6 0h1v1m0 6v1h-1m-6 0H8v-1" />
    </>
  ),
  palette: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="8" cy="9" r="1" />
      <circle cx="14" cy="7" r="1" />
      <circle cx="17" cy="12" r="1" />
      <path d="M6 17h5a2 2 0 0 0 2-2v-1" />
    </>
  ),
  markdown: (
    <>
      <path d="M3 18V6l5 6 5-6v12m4-5 3 3 3-3m-3-7v10" />
    </>
  ),
  settings: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="9" cy="6" r="2" />
      <circle cx="15" cy="12" r="2" />
      <circle cx="9" cy="18" r="2" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type UiIconName = keyof typeof paths;
export default function UiIcon({
  name,
  size = 20,
}: {
  name: UiIconName;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
