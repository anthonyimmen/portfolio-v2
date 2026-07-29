"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ContributionDay } from "../lib/githubContributions";

type Props = {
  weeks: ContributionDay[][];
};

type HoveredDay = {
  day: ContributionDay;
  x: number;
  y: number;
};

const MONTH_LABELS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const toUTCDate = (date: string) => new Date(`${date}T00:00:00Z`);

const formatDate = (date: string) => {
  const parsed = toUTCDate(date);
  return `${MONTH_LABELS[parsed.getUTCMonth()]} ${parsed.getUTCDate()}, ${parsed.getUTCFullYear()}`;
};

const describe = (day: ContributionDay) =>
  `${day.count === 0 ? "no" : day.count} contribution${day.count === 1 ? "" : "s"} on ${formatDate(day.date)}`;

export default function ContributionGrid({ weeks }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<HoveredDay | null>(null);
  const [fades, setFades] = useState({ left: false, right: false });

  // Each column is a full Sunday-to-Saturday week so partial weeks at either
  // end still line up with their weekday row.
  const columns = useMemo(
    () =>
      weeks.map((week) => {
        const slots: Array<ContributionDay | null> = Array(7).fill(null);
        for (const day of week) {
          slots[toUTCDate(day.date).getUTCDay()] = day;
        }
        return slots;
      }),
    [weeks],
  );

  // Label the column that opens each month. Exactly one column per month starts
  // within its first seven days, so labels never collide.
  const monthLabels = useMemo(
    () =>
      columns.map((column) => {
        const firstDay = column.find(Boolean);
        if (!firstDay) return null;
        const date = toUTCDate(firstDay.date);
        return date.getUTCDate() <= 7 ? MONTH_LABELS[date.getUTCMonth()] : null;
      }),
    [columns],
  );

  const syncFades = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    setFades({
      left: scroller.scrollLeft > 2,
      right: scroller.scrollLeft < maxScroll - 2,
    });
  }, []);

  // Open on the most recent week rather than a year ago.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollLeft = scroller.scrollWidth;
    syncFades();

    const observer = new ResizeObserver(syncFades);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [columns, syncFades]);

  const showTooltip = (day: ContributionDay, target: HTMLElement) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const cell = target.getBoundingClientRect();
    const bounds = wrapper.getBoundingClientRect();
    const center = cell.left - bounds.left + cell.width / 2;
    const edgePadding = Math.min(90, bounds.width / 2);
    setHovered({
      day,
      // Keep the tooltip from spilling past either edge of the section.
      x: Math.min(Math.max(center, edgePadding), bounds.width - edgePadding),
      y: cell.top - bounds.top,
    });
  };

  const columnTemplate = { gridTemplateColumns: `repeat(${columns.length}, var(--heatmap-cell))` };

  return (
    <div className="heatmap-wrapper" ref={wrapperRef}>
      <div
        className={`heatmap-scroller${fades.left ? " fade-left" : ""}${
          fades.right ? " fade-right" : ""
        }`}
        ref={scrollerRef}
        onScroll={syncFades}
        onMouseLeave={() => setHovered(null)}
      >
        <div className="heatmap-layout">
          <div className="heatmap-body">
            <div className="heatmap-months" style={columnTemplate} aria-hidden="true">
              {monthLabels.map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>

            <div className="heatmap-grid" style={columnTemplate}>
              {columns.map((column, columnIndex) => (
                <div className="heatmap-column" key={columnIndex}>
                  {column.map((day, dayIndex) =>
                    day ? (
                      <span
                        key={day.date}
                        className="heatmap-cell"
                        data-level={day.level}
                        onMouseEnter={(event) => showTooltip(day, event.currentTarget)}
                      />
                    ) : (
                      <span
                        key={`${columnIndex}-${dayIndex}`}
                        className="heatmap-cell is-empty"
                      />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {hovered ? (
        <div
          className="heatmap-tooltip"
          style={{ left: `${hovered.x}px`, top: `${hovered.y}px` }}
          role="status"
        >
          {describe(hovered.day)}
        </div>
      ) : null}
    </div>
  );
}
