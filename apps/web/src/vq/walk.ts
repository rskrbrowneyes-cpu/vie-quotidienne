import { useCallback, useEffect, useRef, useState } from "react";

import { STORAGE_KEYS } from "./storage";

export type HouseRoom = "office" | "kitchen" | "laundry" | "living" | "play";

export type KottonPos = { x: number; room: HouseRoom };

export const WALK_MS = 900;

const HOUSE_WIDTH = 1800;

const POS_KEY = STORAGE_KEYS.kottonPos;

export const readKottonPos = (): KottonPos => {
  const fallback: KottonPos = { x: 120, room: "living" };
  try {
    const raw = window.localStorage.getItem(POS_KEY);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw) as KottonPos | null;
    if (
      parsed &&
      typeof parsed.x === "number" &&
      ROOM_OFFSET[parsed.room] !== undefined
    ) {
      return { x: Math.max(0, Math.min(HOUSE_WIDTH, parsed.x)), room: parsed.room };
    }
  } catch {
    return fallback;
  }
  return fallback;
};

export const saveKottonPos = (pos: KottonPos) => {
  try {
    window.localStorage.setItem(POS_KEY, JSON.stringify(pos));
  } catch {
    return;
  }
};

export const travelMs = (from: number, to: number) =>
  Math.min(3000, 700 + Math.abs(to - from) * 1.6);

export const ROOM_OFFSET: Record<HouseRoom, number> = {
  office: 0,
  kitchen: 360,
  laundry: 720,
  living: 1080,
  play: 1440,
};

export const pickSpot = (spots: number[], avoid: number): number => {
  const options = spots.filter((spot) => spot !== avoid);
  return options[Math.floor(Math.random() * options.length)] ?? avoid;
};

type WalkOptions = {
  room: HouseRoom;
  getInitialX: () => number;
};

export const useKottonWalk = ({ room, getInitialX }: WalkOptions) => {
  const [catX, setCatX] = useState(getInitialX);
  const [moving, setMoving] = useState(false);
  const [walkDir, setWalkDir] = useState<"left" | "right">("right");
  const [walkMs, setWalkMs] = useState(WALK_MS);
  const xRef = useRef(catX);
  const walkTimer = useRef<number | undefined>(undefined);

  const walkTo = useCallback(
    (target: number, ms = WALK_MS) => {
      const from = xRef.current;
      if (from === target) {
        setWalkMs(ms);
        return;
      }
      if (walkTimer.current !== undefined) window.clearTimeout(walkTimer.current);
      xRef.current = target;
      setWalkDir(target < from ? "left" : "right");
      setMoving(true);
      setWalkMs(ms);
      setCatX(target);
      saveKottonPos({ x: target, room });
      walkTimer.current = window.setTimeout(() => {
        walkTimer.current = undefined;
        setMoving(false);
      }, ms);
    },
    [room]
  );

  useEffect(
    () => () => {
      if (walkTimer.current !== undefined) window.clearTimeout(walkTimer.current);
    },
    []
  );

  return { catX, moving, walkDir, walkMs, walkTo, xRef } as const;
};
