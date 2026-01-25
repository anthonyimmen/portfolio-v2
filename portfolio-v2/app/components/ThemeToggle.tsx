"use client";

import { useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  const handleToggle = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    setTheme(nextTheme);
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
