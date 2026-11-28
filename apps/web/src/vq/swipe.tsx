import { useRef, useState } from "react";
import type { ReactNode, TouchEvent } from "react";

export const SwipeToDelete = ({
  onDelete,
  children,
}: {
  onDelete: () => void;
  children: ReactNode;
}) => {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);

  const handleStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    start.current = { x: touch.clientX, y: touch.clientY };
    setDragging(true);
  };

  const handleMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    const origin = start.current;
    if (!touch || !origin) {
      return;
    }
    const deltaX = touch.clientX - origin.x;
    const deltaY = touch.clientY - origin.y;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setDx(Math.max(-96, Math.min(0, deltaX)));
    }
  };

  const handleEnd = () => {
    setDragging(false);
    start.current = null;
    if (dx <= -64) {
      setDx(0);
      onDelete();
      return;
    }
    setDx(0);
  };

  return (
    <li
      className="touch-pan-y list-none"
      style={{
        transform: `translateX(${dx}px)`,
        transition: dragging ? "none" : "transform 160ms ease",
      }}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      {children}
    </li>
  );
};
