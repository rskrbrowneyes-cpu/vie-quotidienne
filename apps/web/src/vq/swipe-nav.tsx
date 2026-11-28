import { useRef, useState } from "react";
import type { ReactNode, TouchEvent } from "react";

import { STORAGE_KEYS, useStoredState } from "./storage";
import { TABS } from "./tabs";
import type { TabId } from "./tabs";

const SWIPE_MIN_PX = 70;
const SWIPE_MAX_MS = 600;
const DRAG_LIMIT = 24;

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const SwipeZone = ({ children }: { children: ReactNode }) => {
  const [tab, setTab] = useStoredState<TabId>(STORAGE_KEYS.tab, "tasks");
  const index = TABS.findIndex((entry) => entry.id === tab);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const delta = useRef({ x: 0, y: 0 });

  const canPrev = index > 0;
  const canNext = index >= 0 && index < TABS.length - 1;

  const reset = () => {
    start.current = null;
    delta.current = { x: 0, y: 0 };
    setDragging(false);
    setDragX(0);
  };

  const handleStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    start.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
    delta.current = { x: 0, y: 0 };
    setDragging(true);
  };

  const handleMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    const origin = start.current;
    if (!touch || !origin) return;
    const dx = touch.clientX - origin.x;
    const dy = touch.clientY - origin.y;
    delta.current = { x: dx, y: dy };
    if (REDUCED_MOTION || Math.abs(dx) <= Math.abs(dy)) return;
    const raw = (dx > 0 ? canPrev : canNext) ? dx : dx * 0.25;
    setDragX(Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, raw)));
  };

  const handleEnd = () => {
    const origin = start.current;
    const { x: dx, y: dy } = delta.current;
    reset();
    if (!origin) return;
    const elapsed = Date.now() - origin.t;
    if (elapsed > SWIPE_MAX_MS) return;
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) <= Math.abs(dy) * 1.5) return;
    const target = dx < 0 ? TABS[index + 1] : dx > 0 ? TABS[index - 1] : undefined;
    if (target && (dx < 0 ? canNext : canPrev)) setTab(target.id);
  };

  return (
    <div className="relative touch-pan-y">
      <div
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onTouchCancel={reset}
        style={
          REDUCED_MOTION || dragX === 0
            ? undefined
            : {
                transform: `translateX(${dragX}px)`,
                transition: dragging ? "none" : "transform 180ms ease",
              }
        }
      >
        {children}
      </div>
      {canPrev ? (
        <span
          aria-hidden
          className="pointer-events-none absolute left-1 top-1/2 z-20 -translate-y-1/2 text-xl text-muted opacity-50"
        >
          ‹
        </span>
      ) : null}
      {canNext ? (
        <span
          aria-hidden
          className="pointer-events-none absolute right-1 top-1/2 z-20 -translate-y-1/2 text-xl text-muted opacity-50"
        >
          ›
        </span>
      ) : null}
    </div>
  );
};
