import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import "@eiinu/tools/style.css";
import "@eiinu/creative/style.css";
import "@eiinu/editor/style.css";
import Workspace from "./components/Workspace";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";
import {
  categories,
  loadBookmarks,
  storageKey,
  websiteUrl,
  iconChoices,
  validateIconUrl,
  parseBookmarks,
} from "./bookmarks";
import type { Bookmark } from "./bookmarks";
import "./App.css";

type IconName =
  | "sun"
  | "moon"
  | "tools"
  | "search"
  | "edit"
  | "arrow"
  | "plus"
  | "close"
  | "back";
function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
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
    edit: (
      <>
        <path d="m15 4 5 5M4 20l5-1L20 8a2 2 0 0 0-5-5L4 14Z" />
      </>
    ),
    arrow: <path d="M6 18 18 6M6 6h12v12" />,
    plus: <path d="M12 4v16M4 12h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    back: <path d="m12 5-7 7 7 7M5 12h15" />,
  };
  return (
    <svg
      width="20"
      height="20"
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
function SiteIcon({ item }: { item: Bookmark }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  let source: string | undefined;
  if (item.icon === "image") {
    try {
      source = validateIconUrl(item.iconUrl || "");
    } catch {
      /* Keep the letter fallback while an address is incomplete. */
    }
  } else if (item.icon && item.icon !== "letter")
    source = `/icons/${item.icon}.svg`;
  return (
    <span
      className="bookmark-icon"
      aria-hidden="true"
      style={{ color: item.color }}
    >
      {source && source !== failedSource ? (
        <img
          key={source}
          src={source}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailedSource(source)}
        />
      ) : (
        <span className="icon-fallback">{item.name.slice(0, 1)}</span>
      )}
    </span>
  );
}

const engines = {
  Google: "https://www.google.com/search",
  Bing: "https://www.bing.com/search",
  百度: "https://www.baidu.com/s",
};
type Engine = keyof typeof engines;
const blank = {
  name: "",
  url: "",
  description: "",
  category: categories[0],
  favorite: true,
  color: "#718c76",
  icon: "letter",
};
function Homepage() {
  const { isDark, setTheme } = useTheme();
  const [bookmarks, setBookmarks] = useState(loadBookmarks);
  const [view, setView] = useState(() =>
    location.hash === "#tools" ? "tools" : "home",
  );
  const [query, setQuery] = useState("");
  const [engine, setEngine] = useState<Engine>("Google");
  const [managing, setManaging] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Bookmark, "id">>(blank);
  const [error, setError] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const iconFileRef = useRef<HTMLInputElement>(null);
  const backupRef = useRef<HTMLInputElement>(null);
  const [backupMessage, setBackupMessage] = useState("");
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    const onHash = () => setView(location.hash === "#tools" ? "tools" : "home");
    window.addEventListener("hashchange", onHash);
    return () => {
      clearInterval(timer);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);
  useEffect(() => {
    if (editing !== null) dialogRef.current?.showModal();
    else {
      dialogRef.current?.close();
      returnFocus.current?.focus();
    }
  }, [editing]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        view === "home" &&
        editing === null
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [view, editing]);
  function edit(item?: Bookmark, category = categories[0]) {
    returnFocus.current = document.activeElement as HTMLElement;
    setForm(item ? { ...item } : { ...blank, category });
    setError("");
    setEditing(item?.id || "new");
  }
  function persistBookmarks(next: Bookmark[]) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      setStorageError(true);
      throw new Error("保存失败，请导出备份后重试。");
    }
    setStorageError(false);
    setBookmarks(next);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    try {
      const url = websiteUrl(form.url);
      if (!form.name.trim()) {
        setError("请填写网站名称");
        return;
      }
      if (form.icon === "image") validateIconUrl(form.iconUrl || "");
      const item: Bookmark = {
        ...form,
        name: form.name.trim(),
        url,
        id: editing === "new" ? crypto.randomUUID() : editing!,
      };
      persistBookmarks(
        editing === "new"
          ? [...bookmarks, item]
          : bookmarks.map((old) => (old.id === editing ? item : old)),
      );
      setEditing(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "保存失败，请重试。");
    }
  }
  async function uploadIcon(file: File) {
    setError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("请选择 PNG、JPEG 或 WebP 图片。");
      return;
    }
    if (file.size > 131072) {
      setError("图标图片需小于 128 KB。");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string")
        setForm((current) => ({
          ...current,
          icon: "image",
          iconUrl: reader.result as string,
        }));
    };
    reader.onerror = () => setError("图片读取失败，请重试。");
    reader.readAsDataURL(file);
  }
  function exportBookmarks() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(bookmarks, null, 2)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "eiinu-bookmarks.json";
    link.click();
    URL.revokeObjectURL(url);
  }
  async function importBackup(file: File) {
    try {
      if (file.size > 2097152) throw new Error("备份文件超过 2 MB。");
      const incoming = parseBookmarks(JSON.parse(await file.text()));
      const merged = new Map(bookmarks.map((item) => [item.id, item]));
      for (const item of incoming) merged.set(item.id, item);
      const next = [...merged.values()];
      localStorage.setItem(storageKey, JSON.stringify(next));
      setBookmarks(next);
      setBackupMessage("");
    } catch (error) {
      setBackupMessage(error instanceof Error ? error.message : "导入失败。");
    }
  }
  function search(event: FormEvent) {
    const value = query.trim();
    if (!value) {
      event.preventDefault();
      inputRef.current?.focus();
      return;
    }
    // Addresses navigate directly; everything else goes to the chosen search engine.
    if (
      /^https?:\/\//i.test(value) ||
      /^[\w-]+(?:\.[\w-]+)+(?:[/:?#].*)?$/.test(value)
    ) {
      event.preventDefault();
      try {
        window.location.assign(websiteUrl(value));
      } catch {
        inputRef.current?.setCustomValidity("请输入有效的网址");
        inputRef.current?.reportValidity();
      }
    }
  }
  const favorites = bookmarks.filter((item) => item.favorite);
  const sections = categories.map((name) => ({
    name,
    items: bookmarks.filter((item) => item.category === name && !item.favorite),
  }));
  // Figma appears both as a shortcut and within its subject directory, as in the design.
  const figma = bookmarks.find((item) => item.id === "figma" && item.favorite);
  if (figma) sections[categories.indexOf(figma.category)].items.unshift(figma);
  return (
    <div className="personal-home">
      <header className="home-header">
        <a className="home-brand" href="#home" aria-label="Eiinu 导航主页">
          <span className="brand-letter">e.</span>
        </a>
        <nav className="header-actions" aria-label="主导航">
          <button
            className="theme-toggle"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "切换浅色主题" : "切换深色主题"}
          >
            <Icon name={isDark ? "moon" : "sun"} />
          </button>
          <span className="header-divider" />
          <a
            className={view === "tools" ? "current" : ""}
            href={view === "tools" ? "#home" : "#tools"}
          >
            <Icon name={view === "tools" ? "back" : "tools"} />
            <span>{view === "tools" ? "返回主页" : "我的工具"}</span>
          </a>
          <span className="header-divider" />
          <button onClick={() => edit()}>
            <Icon name="plus" />
            <span>添加网站</span>
          </button>
        </nav>
      </header>
      {view === "home" ? (
        <main className="navigation-main">
          <section className="home-intro" aria-labelledby="home-title">
            <time dateTime={now.toISOString()}>
              {new Intl.DateTimeFormat("zh-CN", {
                month: "long",
                day: "numeric",
                weekday: "long",
              }).format(now)}
            </time>
            <h1 id="home-title">留一点时间，给喜欢的事。</h1>
            <form
              className="home-search"
              action={engines[engine]}
              method="get"
              onSubmit={search}
              role="search"
            >
              <span className="google-mark" aria-hidden="true">
                {engine === "Google" ? "G" : engine === "Bing" ? "b" : "百"}
              </span>
              <label className="sr-only" htmlFor="web-search">
                搜索，或输入网址
              </label>
              <input
                id="web-search"
                ref={inputRef}
                name={engine === "百度" ? "wd" : "q"}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  event.target.setCustomValidity("");
                }}
                placeholder="搜索，或输入网址"
                autoComplete="off"
              />
              <kbd
                className="search-shortcut"
                onClick={() => inputRef.current?.focus()}
              >
                ⌘ K
              </kbd>
              <button className="search-submit" type="submit" aria-label="搜索">
                <Icon name="search" />
              </button>
            </form>
            <div className="search-engines" role="group" aria-label="搜索引擎">
              {(Object.keys(engines) as Engine[]).map((name) => (
                <button
                  key={name}
                  aria-pressed={engine === name}
                  className={engine === name ? "selected" : ""}
                  onClick={() => setEngine(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </section>
          {storageError && (
            <p className="storage-warning" role="status">
              浏览器存储不可用，修改暂时无法保存。
            </p>
          )}
          <div className="collection-actions">
            <button onClick={() => backupRef.current?.click()}>导入备份</button>
            <button onClick={exportBookmarks}>导出备份</button>
            <input
              type="file"
              hidden
              ref={backupRef}
              accept=".json,application/json"
              aria-label="选择收藏备份"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importBackup(file);
                event.target.value = "";
              }}
            />
          </div>
          {backupMessage && (
            <p className="form-error" role="alert">
              {backupMessage}
            </p>
          )}
          <section
            className="favorites-section"
            aria-labelledby="favorites-title"
          >
            <div className="section-heading">
              <h2 id="favorites-title">常去的地方</h2>
              <button
                className={managing ? "editing-active" : ""}
                onClick={() => setManaging(!managing)}
                aria-pressed={managing}
              >
                <Icon name="edit" />
                {managing ? "完成" : "编辑"}
              </button>
            </div>
            <div className="favorites-grid">
              {favorites.map((item) => (
                <div className="favorite-site" key={item.id}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <SiteIcon item={item} />
                    <span>{item.name}</span>
                  </a>
                  {managing && (
                    <button
                      className="favorite-edit"
                      aria-label={`编辑 ${item.name}`}
                      onClick={() => edit(item)}
                    >
                      <Icon name="edit" />
                    </button>
                  )}
                </div>
              ))}
              <button className="add-shortcut" onClick={() => edit()}>
                <span>
                  <Icon name="plus" />
                </span>
                添加
              </button>
            </div>
          </section>
          <div className="directory-grid">
            {sections.map(({ name, items }, index) => (
              <section
                className="directory-section"
                key={name}
                aria-labelledby={`category-${index}`}
              >
                <h2 id={`category-${index}`}>{name}</h2>
                <div className="directory-links">
                  {items.map((item) => (
                    <div className="directory-item" key={item.id}>
                      <a
                        href={item.url}
                        title={item.description || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <SiteIcon item={item} />
                        <span className="bookmark-text">
                          <strong>{item.name}</strong>
                        </span>
                        {!managing && <Icon name="arrow" />}
                      </a>
                      {managing && (
                        <button
                          aria-label={`编辑 ${item.name}`}
                          onClick={() => edit(item)}
                        >
                          <Icon name="edit" />
                        </button>
                      )}
                    </div>
                  ))}
                  {items.length === 0 && (
                    <button
                      className="empty-category"
                      onClick={() => edit(undefined, name)}
                    >
                      ＋ 添加一个好去处
                    </button>
                  )}
                </div>
                {managing && (
                  <button
                    className="category-add"
                    onClick={() => edit(undefined, name)}
                  >
                    ＋ 添加网站
                  </button>
                )}
              </section>
            ))}
          </div>
        </main>
      ) : (
        <main className="tools-workspace">
          <Workspace />
        </main>
      )}
      <dialog
        className="bookmark-dialog"
        ref={dialogRef}
        onCancel={() => setEditing(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              setEditing(null);
          }
        }}
        aria-labelledby="dialog-title"
      >
        <div className="dialog-header">
          <h2 id="dialog-title">
            {editing === "new" ? "添加网站" : "编辑网站"}
          </h2>
          <button aria-label="关闭" onClick={() => setEditing(null)}>
            <Icon name="close" />
          </button>
        </div>
        <form onSubmit={save} className="bookmark-form">
          <label>
            网站名称
            <input
              autoFocus
              required
              maxLength={40}
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="例如：我的博客"
            />
          </label>
          <label>
            网站地址
            <input
              required
              value={form.url}
              onChange={(event) =>
                setForm({ ...form, url: event.target.value })
              }
              placeholder="https://example.com"
            />
          </label>
          <label>
            描述
            <input
              maxLength={70}
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="一句话介绍这个网站"
            />
          </label>
          <div className="icon-editor">
            <div className="icon-preview">
              <SiteIcon
                item={{ ...form, id: "preview", name: form.name || "网站" }}
              />
            </div>
            <label>
              图标
              <select
                aria-label="图标"
                value={form.icon || "letter"}
                onChange={(event) => {
                  setError("");
                  setForm({
                    ...form,
                    icon: event.target.value,
                    iconUrl: undefined,
                  });
                }}
              >
                <option value="letter">名称首字</option>
                <optgroup label="网站图标">
                  {iconChoices.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </optgroup>
                <option value="image">自定义图片</option>
              </select>
            </label>
          </div>
          {form.icon === "image" && (
            <div className="custom-icon-fields">
              <label>
                图片地址
                <input
                  type="url"
                  value={
                    form.iconUrl?.startsWith("data:") ? "" : form.iconUrl || ""
                  }
                  onChange={(event) =>
                    setForm({ ...form, iconUrl: event.target.value })
                  }
                  placeholder="https://example.com/icon.png"
                />
              </label>
              <button
                type="button"
                className="icon-upload"
                onClick={() => iconFileRef.current?.click()}
              >
                {form.iconUrl?.startsWith("data:")
                  ? "更换已上传图片"
                  : "上传图片"}
              </button>
              <input
                ref={iconFileRef}
                type="file"
                hidden
                accept="image/png,image/jpeg,image/webp"
                aria-label="上传图标文件"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadIcon(file);
                  event.target.value = "";
                }}
              />
            </div>
          )}
          <div className="form-columns">
            <label>
              分类
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
              >
                {categories.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            {(!form.icon || form.icon === "letter") && (
              <label>
                图标颜色
                <input
                  type="color"
                  value={form.color}
                  onChange={(event) =>
                    setForm({ ...form, color: event.target.value })
                  }
                />
              </label>
            )}
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.favorite}
              onChange={(event) =>
                setForm({ ...form, favorite: event.target.checked })
              }
            />
            显示在常去的地方
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            {editing && editing !== "new" && (
              <button
                type="button"
                className="delete-button"
                onClick={() => {
                  try {
                    persistBookmarks(
                      bookmarks.filter((item) => item.id !== editing),
                    );
                    setEditing(null);
                  } catch (error) {
                    setError(
                      error instanceof Error ? error.message : "删除失败。",
                    );
                  }
                }}
              >
                删除网站
              </button>
            )}
            <button type="button" onClick={() => setEditing(null)}>
              取消
            </button>
            <button className="primary-button" type="submit">
              保存
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
export default function App() {
  return (
    <ThemeProvider>
      <Homepage />
    </ThemeProvider>
  );
}
