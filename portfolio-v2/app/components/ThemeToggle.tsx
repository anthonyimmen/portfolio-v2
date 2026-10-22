"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const THEME_ICONS: Record<Theme, string> = {
  light: "/light%20icon.ico",
  dark: "/dark%20icon.ico",
};

const getTheme = (): Theme =>
  document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";

const getServerTheme = (): Theme => "dark";

const subscribeToTheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
};

const setThemeFavicon = (theme: Theme) => {
  const href = THEME_ICONS[theme];
  let link = document.querySelector<HTMLLinkElement>('link[data-theme-favicon="true"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/x-icon";
    link.setAttribute("data-theme-favicon", "true");
    document.head.appendChild(link);
  }
  link.href = href;
};

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, getServerTheme);

  useEffect(() => {
    setThemeFavicon(theme);
  }, [theme]);

  const handleToggle = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    setThemeFavicon(nextTheme);
  };

  return (
    <button
      type="button"
      className="icon-button"
      aria-label="Toggle theme"
      onClick={handleToggle}
    >
      <i className={`ph-thin ${theme === "dark" ? "ph-sun" : "ph-moon"}`} />
    </button>
  );
}
