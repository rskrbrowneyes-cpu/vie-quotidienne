import { useEffect, useRef, useState } from "react";

import { Kotton } from "./cat";
import type { CatFacing } from "./cat";
import { RoomDiorama } from "./scene";
import { useStoredState } from "./storage";

const WALK_MS = 900;

const IDLE_SPOTS = [60, 96, 132, 168, 204, 240, 276, 312];

const isNight = () => {
  const hour = new Date().getHours();
  return hour >= 20 || hour < 7;
};

const pickSpot = (avoid: number) => {
  const options = IDLE_SPOTS.filter((s) => s !== avoid);
  return options[Math.floor(Math.random() * options.length)] ?? avoid;
};

const ToyMouse = ({ flip }: { flip: boolean }) => (
  <g transform={flip ? "translate(-15 0) scale(-1 1)" : "translate(65 0)"} className="animate-vq-scurry">
    <path
      d="M6 46 Q0 44 -2.5 48.5"
      stroke="#B4AC9C"
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
    />
    <ellipse cx="7" cy="46" rx="6" ry="3.8" fill="#9AA5B1" />
    <circle cx="12.4" cy="44.6" r="2.6" fill="#B4BEC8" />
    <circle cx="13.2" cy="44" r="0.55" fill="#3E2C22" />
    <circle cx="9.4" cy="41.8" r="1.4" fill="#C9B8B0" />
  </g>
);

const YarnBall = () => (
  <g className="animate-vq-bob">
    <circle cx="0" cy="87" r="4.4" fill="#E06A8A" />
    <g stroke="#C25674" strokeWidth="1" fill="none" strokeLinecap="round">
      <path d="M-3.6 85.4 Q0 87.6 3.6 85.4" />
      <path d="M-4 87.6 Q0 89.6 4 87.6" />
      <path d="M-2.4 84 Q0.8 85.8 3.8 84.6" />
    </g>
    <path d="M3.6 90 Q7 92 10.5 90.6" stroke="#E06A8A" strokeWidth="1.1" fill="none" strokeLinecap="round" />
  </g>
);

export function KottonModule() {
  const [catX, setCatX] = useState(120);
  const [moving, setMoving] = useState(false);
  const [walkDir, setWalkDir] = useState<"left" | "right">("right");
  const [pouncing, setPouncing] = useState(false);
  const [purring, setPurring] = useState(false);
  const [mouse, setMouse] = useState(false);
  const [yarnX, setYarnX] = useState<number | null>(null);
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);
  const [cuddles, setCuddles] = useStoredState<number>("vq.kotton.cuddles", 0);
  const xRef = useRef(120);
  const walkTimer = useRef<number | undefined>(undefined);
  const purrTimer = useRef<number | undefined>(undefined);
  const pounceTimer = useRef<number | undefined>(undefined);
  const timers = useRef<number[]>([]);
  const night = isNight();

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(
    () => () => {
      clearTimers();
      if (walkTimer.current !== undefined) window.clearTimeout(walkTimer.current);
      if (purrTimer.current !== undefined) window.clearTimeout(purrTimer.current);
      if (pounceTimer.current !== undefined) window.clearTimeout(pounceTimer.current);
    },
    []
  );

  const walkTo = (target: number) => {
    const from = xRef.current;
    if (from === target) return;
    if (walkTimer.current !== undefined) window.clearTimeout(walkTimer.current);
    xRef.current = target;
    setWalkDir(target < from ? "left" : "right");
    setMoving(true);
    setCatX(target);
    walkTimer.current = window.setTimeout(() => {
      walkTimer.current = undefined;
      setMoving(false);
    }, WALK_MS);
  };

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const pet = () => {
    setCuddles((c) => c + 1);
    setPurring(true);
    if (purrTimer.current !== undefined) window.clearTimeout(purrTimer.current);
    purrTimer.current = window.setTimeout(() => setPurring(false), 1600);
    const batch = [0, 1].map((i) => ({ id: Date.now() + i, left: 38 + Math.random() * 24 }));
    setHearts((h) => [...h, ...batch]);
    later(() => setHearts((h) => h.filter((heart) => !batch.some((b) => b.id === heart.id))), 1700);
  };

  const stopPlaying = () => {
    clearTimers();
    setYarnX(null);
    setMouse(false);
  };

  const chaseMouse = () => {
    stopPlaying();
    setMouse(true);
    const spot = pickSpot(xRef.current);
    walkTo(spot);
    later(() => setPouncing(true), WALK_MS + 60);
    later(() => setPouncing(false), WALK_MS + 760);
    later(() => setMouse(false), WALK_MS + 1600);
  };

  const throwYarn = () => {
    stopPlaying();
    const first = 40 + Math.random() * 290;
    setYarnX(first);
    const chaseStep = (target: number, round: number) => {
      walkTo(target);
      later(() => {
        setPouncing(true);
        const next = Math.max(
          30,
          Math.min(340, target + (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 60))
        );
        setYarnX(next);
        later(() => setPouncing(false), 650);
        if (round < 2) {
          later(() => chaseStep(next, round + 1), 950);
        } else {
          later(() => setYarnX(null), 1600);
        }
      }, WALK_MS + 150);
    };
    chaseStep(first, 0);
  };

  const onSceneTap = (event: React.MouseEvent<SVGRectElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    const catScreenX = catX - camLeft;
    if (point.y > 40 && point.y < 96 && Math.abs(point.x - catScreenX) < 30) {
      pet();
      return;
    }
    if (point.y > 72) {
      stopPlaying();
      walkTo(Math.max(20, Math.min(340, point.x + camLeft)));
    }
  };

  const facing: CatFacing = moving || pouncing ? walkDir : "front";
  const catPose = moving
    ? "animate-vq-walk"
    : pouncing
      ? "animate-vq-pounce"
      : purring
        ? "animate-vq-crouch"
        : undefined;
  const camLeft = Math.max(0, Math.min(200, catX - 80));

  const caption = purring
    ? "Ronron… Kotton adore 🧡"
    : mouse
      ? moving
        ? "Kotton court après la souris !"
        : "Attrapée !"
      : yarnX !== null
        ? moving
          ? "Kotton chasse la boule de laine !"
          : "Hop ! Il la renvoie !"
        : moving
          ? "Kotton vient…"
          : null;

  return (
    <div className="space-y-4">
      <div className="relative h-[38vh] max-h-[420px] min-h-[300px] overflow-hidden rounded-2xl border-2 border-accent bg-[#EAD8B4]">
        <RoomDiorama
          night={night}
          complete={false}
          dishesFx={false}
          vacuumFx={false}
          sweepFx={false}
          litterFx={false}
          laundryFx={false}
          trashFx={false}
          gardenFx={false}
          windowsFx={false}
          camLeft={camLeft}
          catX={catX}
          extraFloor={
            yarnX !== null ? (
              <g
                style={{
                  transform: `translateX(${yarnX}px)`,
                  transition: "transform 500ms ease-out",
                }}
              >
                <YarnBall />
              </g>
            ) : null
          }
        >
          <g transform="translate(0 42)">
            <g key={facing} className="animate-vq-turn">
              <g className={catPose}>
                <Kotton
                  happy={purring}
                  excited={moving || pouncing || yarnX !== null || mouse}
                  facing={facing}
                />
                {mouse ? <ToyMouse flip={walkDir === "left"} /> : null}
              </g>
            </g>
          </g>
        </RoomDiorama>

        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${
            night ? "bg-[#1A2340]/25 opacity-100" : "opacity-0"
          }`}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_58%,rgba(62,44,34,0.22))]"
          aria-hidden
        />

        <svg
          viewBox="0 0 160 120"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <rect
            x="0"
            y="0"
            width="160"
            height="120"
            fill="none"
            pointerEvents="all"
            onClick={onSceneTap}
          />
        </svg>

        <div className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
          🧡 {cuddles} câlins
        </div>

        {caption ? (
          <div className="pointer-events-none absolute inset-x-6 top-2 z-10 flex justify-center">
            <span className="animate-vq-float rounded-full bg-[#221D17]/90 px-3 py-1 text-[11px] font-semibold text-[#FFF9F2]">
              {caption}
            </span>
          </div>
        ) : null}

        {hearts.map((heart) => (
          <span
            key={heart.id}
            aria-hidden
            className="animate-vq-heart pointer-events-none absolute bottom-[42%] text-lg"
            style={{ left: `${heart.left}%` }}
          >
            🧡
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={throwYarn}
          className="flex items-center justify-center gap-2 rounded-xl border border-line bg-raised px-3 py-3 text-sm font-semibold active:opacity-90"
        >
          🧶 Boule de laine
        </button>
        <button
          type="button"
          onClick={chaseMouse}
          className="flex items-center justify-center gap-2 rounded-xl border border-line bg-raised px-3 py-3 text-sm font-semibold active:opacity-90"
        >
          🐭 Lâcher la souris
        </button>
      </div>

      <p className="text-center text-xs text-muted">
        Touchez le sol : Kotton vient. Caressez-le : il ronronne !
      </p>
    </div>
  );
}
