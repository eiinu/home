export const categories = ["工作与创造", "阅读与发现", "日常与生活"];
export type Bookmark = {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  favorite: boolean;
  color: string;
  icon?: string;
  iconUrl?: string;
};
const rows = [
  ["github", "GitHub", "https://github.com", "代码与协作", 0, true, "#24292f"],
  [
    "chatgpt",
    "ChatGPT",
    "https://chatgpt.com",
    "思考、学习与创作",
    0,
    true,
    "#087f6d",
  ],
  [
    "notion",
    "Notion",
    "https://www.notion.so",
    "记录想法，整理生活",
    0,
    true,
    "#242424",
  ],
  ["figma", "Figma", "https://www.figma.com", "设计与协作", 0, true, "#a259ff"],
  [
    "bilibili",
    "Bilibili",
    "https://www.bilibili.com",
    "发现有趣的内容",
    1,
    true,
    "#00aeec",
  ],
  [
    "youtube",
    "YouTube",
    "https://www.youtube.com",
    "看看更大的世界",
    1,
    true,
    "#ff0033",
  ],
  [
    "gmail",
    "Gmail",
    "https://mail.google.com",
    "邮件与联系",
    2,
    true,
    "#ea4335",
  ],
  ["vercel", "Vercel", "https://vercel.com", "让想法上线", 0, false, "#202020"],
  [
    "sspai",
    "少数派",
    "https://sspai.com",
    "找到更好的生活方式",
    1,
    false,
    "#db3036",
  ],
  [
    "zhihu",
    "知乎",
    "https://www.zhihu.com",
    "看见不同的答案",
    1,
    false,
    "#0084ff",
  ],
  [
    "douban",
    "豆瓣",
    "https://www.douban.com",
    "书影音里的小世界",
    1,
    false,
    "#007722",
  ],
  [
    "translate",
    "Google 翻译",
    "https://translate.google.com",
    "跨过语言的小障碍",
    2,
    false,
    "#4285f4",
  ],
] as const;
export const defaults: Bookmark[] = rows.map(
  ([id, name, url, description, category, favorite, color]) => ({
    id,
    name,
    url,
    description,
    category: categories[category],
    favorite,
    color,
    icon: id,
  }),
);
export function validateIconUrl(value: string): string {
  const input = value.trim();
  if (
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(input) &&
    input.length <= 180000
  )
    return input;
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("请输入有效的 HTTPS 图片地址，或上传图片。");
  }
  if (url.protocol !== "https:" || url.username || url.password)
    throw new Error("请使用 HTTPS 图片地址，或上传 PNG、JPEG、WebP 图片。");
  return url.href;
}
export const storageKey = "eiinu-navigation-v1";
export function websiteUrl(value: string) {
  const input = value.trim();
  if (
    !input ||
    (/^[a-z][a-z\d+.-]*:/i.test(input) && !/^https?:\/\//i.test(input))
  )
    throw new Error("请输入 http 或 https 网站地址");
  const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  if (!url.hostname.includes(".") || url.username || url.password)
    throw new Error("请输入有效的网站地址");
  return url.href;
}
export function parseBookmarks(stored: unknown): Bookmark[] {
  const oldCategories: Record<string, string> = {
    效率工具: categories[0],
    设计灵感: categories[0],
    开发世界: categories[0],
  };
  if (
    Array.isArray(stored) &&
    stored.every(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.url === "string" &&
        typeof item.description === "string" &&
        (categories.includes(item.category) ||
          Object.hasOwn(oldCategories, item.category)) &&
        typeof item.favorite === "boolean" &&
        /^#[\da-f]{6}$/i.test(item.color) &&
        (!item.icon || /^[a-z]+$/.test(item.icon)) &&
        (item.iconUrl === undefined || typeof item.iconUrl === "string") &&
        (item.icon !== "image" || Boolean(item.iconUrl)),
    )
  ) {
    return stored.map((item) => ({
      ...item,
      url: websiteUrl(item.url),
      category: oldCategories[item.category] || item.category,
      ...(item.iconUrl ? { iconUrl: validateIconUrl(item.iconUrl) } : {}),
      icon:
        item.icon ||
        defaults.find((defaultItem) => defaultItem.id === item.id)?.icon,
    }));
  }
  throw new Error("收藏数据格式不正确");
}
// Retired sites must also disappear from collections saved by earlier versions.
const retiredHosts = [
  "linear.app",
  "are.na",
  "developer.mozilla.org",
  "amap.com",
  "dida365.com",
  "ticktick.com",
  "music.apple.com",
];
function isRetiredSite(item: Bookmark) {
  const host = new URL(item.url).hostname.toLowerCase();
  return retiredHosts.some(
    (retired) => host === retired || host.endsWith(`.${retired}`),
  );
}
export function loadBookmarks(): Bookmark[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(storageKey) || "null",
    );
    return parseBookmarks(stored).filter((item) => !isRetiredSite(item));
  } catch {
    return defaults;
  }
}
