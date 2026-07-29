"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  mobileOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "about", href: "#about", icon: "ph-user" },
  { label: "activity", href: "#activity", icon: "ph-pulse" },
  { label: "projects", href: "#projects", icon: "ph-folder-simple" },
  { label: "contact", href: "#contact", icon: "ph-envelope-simple" },
  { label: "chat", href: "#chat", icon: "ph-chat-teardrop-text", mobileOnly: true },
];

export default function TopMenu() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const sync = () => setIsMobile(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  const items = useMemo(
    () => NAV_ITEMS.filter((item) => !item.mobileOnly || isMobile),
    [isMobile],
  );

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  // Close on outside press. pointerdown covers touch as well as mouse.
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  // Move focus into the menu so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (!open) return;
    linkRefs.current[0]?.focus({ preventScroll: true });
  }, [open]);

  // Highlight whichever section is currently in view.
  useEffect(() => {
    const sections = items
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((section): section is HTMLElement => Boolean(section));
    if (sections.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(`#${entry.target.id}`);
          else visible.delete(`#${entry.target.id}`);
        }
        const current = items.find((item) => visible.has(item.href));
        setActiveHref(current?.href ?? null);
      },
      { rootMargin: "-25% 0px -60% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const focusable = linkRefs.current.filter(
      (node): node is HTMLAnchorElement => Boolean(node?.isConnected),
    );
    if (focusable.length === 0) return;
    const currentIndex = focusable.indexOf(
      document.activeElement as HTMLAnchorElement,
    );

    const focusAt = (index: number) => {
      event.preventDefault();
      focusable[(index + focusable.length) % focusable.length]?.focus();
    };

    if (event.key === "ArrowDown") focusAt(currentIndex + 1);
    else if (event.key === "ArrowUp") focusAt(currentIndex - 1);
    else if (event.key === "Home") focusAt(0);
    else if (event.key === "End") focusAt(focusable.length - 1);
  };

  return (
    <div className="menu" ref={wrapperRef}>
      {/* Portalled so the transformed topbar can't turn `position: fixed`
          into a box the size of the header. */}
      {open && typeof document !== "undefined"
        ? createPortal(<div className="menu-scrim" aria-hidden="true" />, document.body)
        : null}
      <button
        ref={buttonRef}
        className={`icon-button menu-trigger${open ? " is-open" : ""}`}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="top-menu"
        onClick={() => setOpen((prev) => !prev)}
      >
        <i className={`ph-thin ${open ? "ph-x" : "ph-article"}`} />
      </button>
      {open ? (
        <div
          className="menu-dropdown"
          id="top-menu"
          role="menu"
          aria-label="Site sections"
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, index) => (
            <a
              key={item.href}
              ref={(node) => {
                linkRefs.current[index] = node;
              }}
              className={`menu-link${activeHref === item.href ? " is-active" : ""}`}
              href={item.href}
              role="menuitem"
              aria-current={activeHref === item.href ? "true" : undefined}
              onClick={() => close()}
            >
              <i className={`ph ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
