import { useEffect, useRef, useState } from "react";

import { Kotton } from "./cat";
import type { CatFacing } from "./cat";
import { RoomDiorama } from "./scene";
import { useStoredState } from "./storage";

type GameId = "none" | "mouse" | "ball";

const isNight = () => {
  const hour = new Date().getHours();
  return hour >= 20 || hour < 7;
};

const MouseSvg = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 18 14" className={className} aria-hidden>
    <path
      d="M2.5 9.5 Q0.6 7.4 1.2 12"
      stroke="#B4AC9C"
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
    />
    <ellipse cx="7.5" cy="9" rx="6" ry="3.6" fill="#9AA5B1" />
    <circle cx="13.4" cy="7.6" r="2.6" fill="#B4BEC8" />
    <circle cx="11.4" cy="4.8" r="1.4" fill="#C9B8B0" />
    <circle cx="14.2" cy="7" r="0.55" fill="#3E2C22" />
  </svg>
);

const KottonPortrait = ({ className = "size-28" }: { className?: string }) => (
  <svg
    viewBox="0 0 64 52"
    className={`${className} drop-shadow-md`}
    role="img"
    aria-label="Kotton, le chat roux mascotte"
  >
    <Kotton happy />
  </svg>
);

const holeFacing = (hole: number): CatFacing =>
  hole <= 1 ? "left" : hole >= 4 ? "right" : "front";

const MouseGame = () => {
  const [phase, setPhase] = useState<"run" | "over">("run");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ hole: number; id: number } | null>(null);
  const [pounce, setPounce] = useState(false);
  const [facing, setFacing] = useState<CatFacing>("front");
  const [best, setBest] = useStoredState<number>("vq.kotton.mouseBest", 0);
  const [newRecord, setNewRecord] = useState(false);
  const scoreRef = useRef(0);
  const pounceTimer = useRef<number | undefined>(undefined);
  const night = isNight();

  useEffect(() => {
    if (phase !== "run") return;
    let alive = true;
    let hideTimer: number | undefined;
    let nextTimer: number | undefined;
    const loop = () => {
      if (!alive) return;
      const hole = Math.floor(Math.random() * 6);
      setActiveHole(hole);
      setFacing(holeFacing(hole));
      const delay = Math.max(430, 950 - scoreRef.current * 40);
      hideTimer = window.setTimeout(() => {
        if (!alive) return;
        setActiveHole(null);
        nextTimer = window.setTimeout(loop, 320);
      }, delay);
    };
    nextTimer = window.setTimeout(loop, 600);
    const countdown = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(countdown);
          setPhase("over");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      alive = false;
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
      if (nextTimer !== undefined) window.clearTimeout(nextTimer);
      window.clearInterval(countdown);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "over") return;
    if (score > best) {
      setBest(score);
      setNewRecord(true);
    }
  }, [phase, score, best, setBest]);

  useEffect(
    () => () => {
      if (pounceTimer.current !== undefined) window.clearTimeout(pounceTimer.current);
    },
    []
  );

  const catchMouse = (hole: number) => {
    if (phase !== "run" || activeHole !== hole) return;
    setActiveHole(null);
    setFacing(holeFacing(hole));
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
    setFlash({ hole, id: Date.now() });
    setPounce(true);
    if (pounceTimer.current !== undefined) window.clearTimeout(pounceTimer.current);
    pounceTimer.current = window.setTimeout(() => setPounce(false), 700);
  };

  return (
    <div className="space-y-3">
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
          camLeft={40}
          catX={120}
        >
          <g transform="translate(0 42)">
            <g key={facing} className="animate-vq-turn">
              <g className={pounce ? "animate-vq-pounce" : undefined}>
                <Kotton
                  happy={phase === "over"}
                  excited={pounce}
                  facing={facing}
                />
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

        <span className="absolute left-2 top-2 z-10 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
          🐭 {score}
        </span>
        <span
          className={`absolute right-2 top-2 z-10 rounded-full px-3 py-1 text-xs font-semibold ${
            timeLeft <= 5
              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
              : "bg-teal-500/15 text-teal-700 dark:text-teal-300"
          }`}
        >
          ⏱ {timeLeft} s
        </span>

        <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center">
          <span className="rounded-full bg-[#221D17]/90 px-3 py-1 text-[11px] font-semibold text-[#FFF9F2]">
            {phase === "over"
              ? newRecord
                ? "Nouveau record ! 🏆"
                : `Score final : ${score}`
              : pounce
                ? "Attrapée !"
                : "Guette la souris…"}
          </span>
        </div>

        <div className="absolute inset-x-2 bottom-[4%] z-10 grid grid-cols-6 gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((hole) => (
            <button
              key={hole}
              type="button"
              aria-label={`Cachette ${hole + 1}`}
              onClick={() => catchMouse(hole)}
              className="relative h-16 active:opacity-90"
            >
              <span
                aria-hidden
                className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-all duration-150 ${
                  activeHole === hole
                    ? "translate-y-0 opacity-100"
                    : "translate-y-3 opacity-0"
                }`}
              >
                <MouseSvg className="h-4 w-6" />
              </span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-11 rounded-lg border-2 border-[#8B5E34] bg-[#C9A876] shadow-sm"
              >
                <span className="absolute inset-x-0 top-0 h-2.5 rounded-t-md bg-[#B08A5A]" />
              </span>
              {flash?.hole === hole ? (
                <span
                  key={flash.id}
                  aria-hidden
                  className="animate-vq-particle absolute inset-x-0 bottom-4 text-center text-sm font-bold text-accent"
                >
                  +1
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {phase === "over" ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#221D17]/60">
            <p className="text-lg font-bold text-white">
              {newRecord ? "Nouveau record ! 🏆" : `${score} souris attrapées !`}
            </p>
            <button
              type="button"
              onClick={() => {
                setScore(0);
                scoreRef.current = 0;
                setTimeLeft(30);
                setNewRecord(false);
                setFacing("front");
                setPhase("run");
              }}
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white active:opacity-90"
            >
              Rejouer
            </button>
          </div>
        ) : null}
      </div>

      <p className="text-center text-xs text-muted">
        Record : {Math.max(best, score)} souris — Kotton regarde du côté de la cachette !
      </p>
    </div>
  );
};

const BallGame = () => {
  const [phase, setPhase] = useState<"run" | "over">("run");
  const [score, setScore] = useState(0);
  const [facing, setFacing] = useState<CatFacing>("front");
  const [low, setLow] = useState(false);
  const [best, setBest] = useStoredState<number>("vq.kotton.ballBest", 0);
  const [newRecord, setNewRecord] = useState(false);
  const areaRef = useRef<HTMLDivElement | null>(null);
  const ballRef = useRef<HTMLDivElement | null>(null);
  const shadowRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef({ x: 50, y: 120 });
  const velRef = useRef({ x: 0.8, y: 0 });
  const facingRef = useRef<CatFacing>("front");
  const lowRef = useRef(false);
  const night = isNight();

  useEffect(() => {
    if (phase !== "over") return;
    setBest((b) => {
      if (score > b) {
        setNewRecord(true);
        return score;
      }
      return b;
    });
  }, [phase, score, setBest]);

  useEffect(() => {
    if (phase !== "run") return;
    const area = areaRef.current;
    const ball = ballRef.current;
    const shadow = shadowRef.current;
    if (!area || !ball) return;
    posRef.current = { x: 50, y: area.clientHeight * 0.3 };
    velRef.current = {
      x: (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 0.6),
      y: 0,
    };
    let raf = 0;
    const step = () => {
      const areaH = area.clientHeight;
      const floorY = areaH * 0.88;
      const vel = velRef.current;
      const pos = posRef.current;
      vel.y += 0.32;
      pos.y += vel.y;
      pos.x += vel.x;
      if (pos.x < 6) {
        pos.x = 6;
        vel.x = Math.abs(vel.x);
      }
      if (pos.x > 94) {
        pos.x = 94;
        vel.x = -Math.abs(vel.x);
      }
      if (pos.y >= floorY) {
        pos.y = floorY;
        ball.style.top = `${pos.y}px`;
        setPhase("over");
        return;
      }
      ball.style.top = `${pos.y}px`;
      ball.style.left = `${pos.x}%`;
      if (shadow) {
        shadow.style.left = `${pos.x}%`;
        const closeness = Math.max(0.25, 1 - (floorY - pos.y) / floorY);
        shadow.style.transform = `translateX(-50%) scaleX(${closeness})`;
        shadow.style.opacity = `${0.15 + closeness * 0.15}`;
      }
      const f: CatFacing = pos.x < 45 ? "left" : pos.x > 55 ? "right" : "front";
      if (f !== facingRef.current) {
        facingRef.current = f;
        setFacing(f);
      }
      const isLow = pos.y > floorY * 0.55;
      if (isLow !== lowRef.current) {
        lowRef.current = isLow;
        setLow(isLow);
      }
      raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [phase]);

  const bounce = () => {
    if (phase !== "run") return;
    velRef.current.y = -7.6;
    velRef.current.x += (Math.random() - 0.5) * 0.8;
    velRef.current.x = Math.max(-2.2, Math.min(2.2, velRef.current.x));
    setScore((s) => s + 1);
  };

  return (
    <div className="space-y-3">
      <div
        ref={areaRef}
        onPointerDown={bounce}
        className="relative h-[38vh] max-h-[420px] min-h-[300px] touch-none select-none overflow-hidden rounded-2xl border-2 border-accent bg-[#EAD8B4]"
      >
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
          camLeft={40}
          catX={120}
        >
          <g transform="translate(0 42)">
            <g key={facing} className="animate-vq-turn">
              <g className={low ? "animate-vq-crouch" : undefined}>
                <Kotton happy={phase === "over"} excited={low} facing={facing} />
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

        <span className="absolute left-2 top-2 z-10 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
          🏀 {score}
        </span>
        <span className="absolute right-2 top-2 z-10 rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
          Record : {Math.max(best, score)}
        </span>

        <div
          ref={shadowRef}
          className="pointer-events-none absolute bottom-[9%] h-2 w-8 -translate-x-1/2 rounded-[50%] bg-[#3E2C22] blur-[2px]"
          style={{ left: "50%" }}
          aria-hidden
        />
        <div
          ref={ballRef}
          className="pointer-events-none absolute size-7 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_32%_28%,#FFB877,#FF7000_58%,#C95A00)] shadow-md"
          style={{ top: "120px", left: "50%" }}
          aria-hidden
        />

        {phase === "over" ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#221D17]/60">
            <p className="text-lg font-bold text-white">
              {newRecord ? "Nouveau record ! 🏆" : `La balle est tombée : ${score}`}
            </p>
            <button
              type="button"
              onClick={() => {
                setScore(0);
                setNewRecord(false);
                setFacing("front");
                setPhase("run");
              }}
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white active:opacity-90"
            >
              Rejouer
            </button>
          </div>
        ) : null}
      </div>

      <p className="text-center text-xs text-muted">
        Touchez l'écran pour renvoyer la balle — Kotton court après !
      </p>
    </div>
  );
};

export function KottonModule() {
  const [game, setGame] = useState<GameId>("none");

  if (game === "mouse") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Retour"
            onClick={() => setGame("none")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line active:opacity-80"
          >
            ‹
          </button>
          <h2 className="text-lg font-semibold">Souris !</h2>
        </div>
        <MouseGame />
      </div>
    );
  }

  if (game === "ball") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Retour"
            onClick={() => setGame("none")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line active:opacity-80"
          >
            ‹
          </button>
          <h2 className="text-lg font-semibold">Balle rebondissante</h2>
        </div>
        <BallGame />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border-2 border-accent bg-[#EAD8B4] px-4 py-5">
        <div className="flex items-center gap-4">
          <KottonPortrait className="size-28 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-lg font-bold">Kotton</h2>
            <p className="text-sm text-[#6B5138]">
              Joue avec lui dans sa pièce ! Il adore la chasse et les ballons.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setGame("mouse")}
        className="flex w-full items-center gap-4 rounded-2xl border border-line bg-raised px-4 py-4 text-left active:opacity-90"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-xl" aria-hidden>
          🐭
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">Souris !</span>
          <span className="block text-xs text-muted">
            Tape sur la souris avant qu'elle se cache — ça accélère !
          </span>
        </span>
        <span className="text-muted" aria-hidden>
          ›
        </span>
      </button>

      <button
        type="button"
        onClick={() => setGame("ball")}
        className="flex w-full items-center gap-4 rounded-2xl border border-line bg-raised px-4 py-4 text-left active:opacity-90"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-xl" aria-hidden>
          🏀
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">Balle rebondissante</span>
          <span className="block text-xs text-muted">
            Ne laissez jamais tomber la balle — Kotton court après !
          </span>
        </span>
        <span className="text-muted" aria-hidden>
          ›
        </span>
      </button>
    </div>
  );
}
