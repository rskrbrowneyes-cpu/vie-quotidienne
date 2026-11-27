import { useEffect, useRef, useState } from "react";

import { Kotton } from "./cat";
import type { CatFacing } from "./cat";
import { useStoredState } from "./storage";

type GameId = "none" | "mouse" | "ball";

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

const KottonPortrait = ({
  happy,
  excited,
  pose,
  facing = "front",
  className = "size-28",
}: {
  happy?: boolean;
  excited?: boolean;
  pose?: string;
  facing?: CatFacing;
  className?: string;
}) => (
  <svg
    viewBox="0 0 64 52"
    className={`${className} drop-shadow-md`}
    role="img"
    aria-label="Kotton, le chat roux mascotte"
  >
    <g className={pose}>
      <Kotton happy={happy} excited={excited} facing={facing} />
    </g>
  </svg>
);

const MouseGame = () => {
  const [phase, setPhase] = useState<"run" | "over">("run");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ hole: number; id: number } | null>(null);
  const [pounce, setPounce] = useState(false);
  const [best, setBest] = useStoredState<number>("vq.kotton.mouseBest", 0);
  const [newRecord, setNewRecord] = useState(false);
  const scoreRef = useRef(0);
  const pounceTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (phase !== "run") return;
    let alive = true;
    let hideTimer: number | undefined;
    let nextTimer: number | undefined;
    const loop = () => {
      if (!alive) return;
      setActiveHole(Math.floor(Math.random() * 6));
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
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
          🐭 {score}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            timeLeft <= 5
              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
              : "bg-teal-500/15 text-teal-700 dark:text-teal-300"
          }`}
        >
          ⏱ {timeLeft} s
        </span>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-line bg-raised p-4">
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((hole) => (
            <button
              key={hole}
              type="button"
              aria-label={`Cachette ${hole + 1}`}
              onClick={() => catchMouse(hole)}
              className="relative h-20 overflow-hidden rounded-xl border-2 border-line bg-[#C9A876] active:opacity-90"
            >
              <span
                className={`absolute inset-x-0 top-0 h-3 rounded-t-lg bg-[#B08A5A] transition-transform ${
                  activeHole === hole ? "-translate-y-full" : "translate-y-0"
                }`}
                aria-hidden
              />
              <span
                className={`absolute inset-x-0 top-1 flex justify-center transition-transform duration-150 ${
                  activeHole === hole ? "translate-y-1" : "translate-y-14"
                }`}
                aria-hidden
              >
                <MouseSvg className="h-5 w-7" />
              </span>
              {flash?.hole === hole ? (
                <span
                  key={flash.id}
                  className="animate-vq-particle absolute inset-x-0 top-0 text-center text-sm font-bold text-accent"
                  aria-hidden
                >
                  +1
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-[#7FB5B0]/30"
          aria-hidden
        />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-raised px-4 py-3">
        <p className="min-w-0 flex-1 text-sm font-medium">
          {phase === "over"
            ? newRecord
              ? "Nouveau record ! 🏆"
              : `Score final : ${score}`
            : pounce
              ? "Attrapée !"
              : "Guette la souris…"}
        </p>
        <KottonPortrait
          happy={phase === "over"}
          excited={pounce}
          pose={pounce ? "animate-vq-pounce" : undefined}
          className="size-20 shrink-0"
        />
      </div>

      {phase === "over" ? (
        <button
          type="button"
          onClick={() => {
            setScore(0);
            scoreRef.current = 0;
            setTimeLeft(30);
            setNewRecord(false);
            setPhase("run");
          }}
          className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white active:opacity-90"
        >
          Rejouer
        </button>
      ) : null}

      <p className="text-center text-xs text-muted">
        Record : {Math.max(best, score)} souris
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
  const posRef = useRef({ x: 50, y: 40 });
  const velRef = useRef({ x: 0.8, y: 0 });
  const facingRef = useRef<CatFacing>("front");
  const lowRef = useRef(false);

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
    posRef.current = { x: 50, y: 40 };
    velRef.current = {
      x: (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 0.6),
      y: 0,
    };
    let raf = 0;
    const step = () => {
      const areaH = area.clientHeight;
      const floorY = areaH - 60;
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
      const f: CatFacing = pos.x < 50 ? "left" : "right";
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
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
          🏀 {score}
        </span>
        <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
          Record : {Math.max(best, score)}
        </span>
      </div>

      <div
        ref={areaRef}
        onPointerDown={bounce}
        className="relative h-72 touch-none overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-[#E9EDDA] to-[#D2DCC0]"
      >
        <div className="absolute inset-x-0 bottom-0 h-10 bg-[#B98A56]" aria-hidden />
        <div className="absolute inset-x-0 bottom-10 h-1 bg-[#9A6B3F]/50" aria-hidden />
        <div
          ref={shadowRef}
          className="absolute bottom-[46px] h-2 w-8 -translate-x-1/2 rounded-[50%] bg-[#3E2C22] blur-[2px]"
          style={{ left: "50%" }}
          aria-hidden
        />
        <div
          ref={ballRef}
          className="absolute size-7 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_32%_28%,#FFB877,#FF7000_58%,#C95A00)] shadow-md"
          style={{ top: "40px", left: "50%" }}
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-1 flex justify-center">
          <KottonPortrait
            facing={facing}
            excited={low}
            happy={phase === "over"}
            pose={low ? "animate-vq-crouch" : undefined}
            className="size-24"
          />
        </div>
        {phase === "over" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#221D17]/60">
            <p className="text-lg font-bold text-white">
              {newRecord ? "Nouveau record ! 🏆" : `La balle est tombée : ${score}`}
            </p>
            <button
              type="button"
              onClick={() => {
                setScore(0);
                setNewRecord(false);
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
        Touchez l'écran pour renvoyer la balle — Kotton vous suit des yeux !
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
          <KottonPortrait happy className="size-28 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-lg font-bold">Kotton</h2>
            <p className="text-sm text-[#6B5138]">
              Joue avec lui ! Il adore la chasse et les ballons.
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
