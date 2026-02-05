"use client";

import { useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  { label: "about", href: "#about", mobileOnly: false },
  { label: "projects", href: "#projects", mobileOnly: false },
  { label: "contact", href: "#contact", mobileOnly: false },
  // { label: "chat", href: "#chat", mobileOnly: true },
];

export default function TopMenu() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const items = NAV_ITEMS.filter((item) => !item.mobileOnly || isMobile);

  return (
    <div className="menu" ref={wrapperRef}>
      <button
        className="icon-button"
        type="button"
        aria-label="Open menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <i className="ph-thin ph-article" />
      </button>
      {open ? (
        <div className="menu-dropdown" role="menu">
          {items.map((item) => (
            <a
              key={item.href}
              className="menu-link"
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
