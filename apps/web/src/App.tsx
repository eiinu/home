import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import "@eiinu/tools/style.css";
import "@eiinu/creative/style.css";
import "@eiinu/editor/style.css";
import Workspace from "./components/Workspace";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";
import { categories, loadBookmarks, websiteUrl } from "./bookmarks";
import Icon from "./components/UiIcon";
import type { Bookmark } from "./bookmarks";
import { validateIconUrl } from "./bookmarks";
import "./App.css";

function SiteIcon({ item }: { item: Bookmark }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  let source: string | undefined;
  if (item.icon === "image") {
    try {
      source = validateIconUrl(item.iconUrl || "");
    } catch {
      /* Unavailable custom images use the existing letter fallback. */
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
function Homepage() {
  const { isDark, setTheme } = useTheme();
  const [bookmarks] = useState(loadBookmarks);
  const [view, setView] = useState(() =>
    location.hash === "#tools" ? "tools" : "home",
  );
  const [query, setQuery] = useState("");
  const [engine, setEngine] = useState<Engine>("Google");
  const [now, setNow] = useState(() => new Date());
  const inputRef = useRef<HTMLInputElement>(null);
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
    const shortcut = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        view === "home"
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [view]);
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
              <span className="search-symbol">
                <Icon name="globe" size={23} />
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
          <section
            className="favorites-section"
            aria-labelledby="favorites-title"
          >
            <div className="section-heading">
              <h2 id="favorites-title">常去的地方</h2>
            </div>
            <div className="favorites-grid">
              {favorites.map((item) => (
                <div className="favorite-site" key={item.id}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <SiteIcon item={item} />
                    <span>{item.name}</span>
                  </a>
                </div>
              ))}
            </div>
          </section>
          <div className="directory-grid">
            {sections
              .filter((section) => section.items.length > 0)
              .map(({ name, items }, index) => (
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
                          <Icon name="arrow" />
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
          </div>
        </main>
      ) : (
        <main className="tools-workspace">
          <Workspace />
        </main>
      )}
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
