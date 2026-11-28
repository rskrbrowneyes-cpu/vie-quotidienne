import { useRef } from "react";
import type { ReactNode, TouchEvent } from "react";

import { STORAGE_KEYS, useStoredState } from "./storage";
import { TABS } from "./tabs";
import type { TabId } from "./tabs";

const SWIPE_MIN_PX = 70;
const SWIPE_MAX_MS = 600;

export const SwipeZone = ({ children }: { children: ReactNode }) => {
  const [tab, setTab] = useStoredState<TabId>(STORAGE_KEYS.tab, "tasks");
  const index = TABS.findIndex((entry) => entry.id === tab);
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const delta = useRef({ x: 0, y: 0 });
  const prevRef = useRef<HTMLSpanElement | null>(null);
  const nextRef = useRef<HTMLSpanElement | null>(null);

  const canPrev = index > 0;
  const canNext = index >= 0 && index < TABS.length - 1;

  const setHighlight = (dir: -1 | 0 | 1) => {
    if (prevRef.current) {
      prevRef.current.style.opacity = dir === -1 ? "1" : "";
      prevRef.current.style.transform =
        dir === -1 ? "translate(-3px, -50%)" : "";
    }
    if (nextRef.current) {
      nextRef.current.style.opacity = dir === 1 ? "1" : "";
      nextRef.current.style.transform =
        dir === 1 ? "translate(3px, -50%)" : "";
    }
  };

  const reset = () => {
    start.current = null;
    delta.current = { x: 0, y: 0 };
    setHighlight(0);
  };

  const handleStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    start.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
    delta.current = { x: 0, y: 0 };
  };

  const handleMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    const origin = start.current;
    if (!touch || !origin) return;
    const dx = touch.clientX - origin.x;
    const dy = touch.clientY - origin.y;
    delta.current = { x: dx, y: dy };
    if (dx < 0 && canNext) setHighlight(1);
    else if (dx > 0 && canPrev) setHighlight(-1);
    else setHighlight(0);
  };

  const handleEnd = () => {
    const origin = start.current;
    const { x: dx, y: dy } = delta.current;
    reset();
    if (!origin) return;
    const elapsed = Date.now() - origin.t;
    if (elapsed > SWIPE_MAX_MS) return;
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) <= Math.abs(dy) * 1.5)
      return;
    const target = dx < 0 ? TABS[index + 1] : dx > 0 ? TABS[index - 1] : undefined;
    if (target && (dx < 0 ? canNext : canPrev)) setTab(target.id);
  };

  return (
    <div
      className="relative touch-pan-y"
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={reset}
    >
      {children}
      {canPrev ? (
        <span
          ref={prevRef}
          aria-hidden
          className="pointer-events-none absolute left-1 top-1/2 z-20 -translate-y-1/2 text-xl text-muted opacity-50 transition-all duration-100"
        >
          ‹
        </span>
      ) : null}
      {canNext ? (
        <span
          ref={nextRef}
          aria-hidden
          className="pointer-events-none absolute right-1 top-1/2 z-20 -translate-y-1/2 text-xl text-muted opacity-50 transition-all duration-100"
        >
          ›
        </span>
      ) : null}
    </div>
  );
};
