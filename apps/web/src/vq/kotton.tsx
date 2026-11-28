import { useEffect, useRef, useState } from "react";

import { Kotton } from "./cat";
import type { CatFacing } from "./cat";
import { useIsNight } from "./clock";
import {
  HouseWorld,
  readKottonPos,
  ToyMouse,
  travelMs,
} from "./scene";
import { pickSpot, useKottonWalk, WALK_MS } from "./walk";
import { STORAGE_KEYS, useStoredState } from "./storage";
import { SwipeZone } from "./swipe-nav";

const IDLE_SPOTS = [1140, 1176, 1212, 1248, 1284, 1320, 1352];

const AFFECTION_TITLES = [
  "Chaton curieux",
  "Explorateur",
  "Chasseur",
  "Caïd du salon",
  "Légende du duplex",
];

const CarriedMouse = () => (
  <g>
    <path
      d="M-4.6 0.4 Q-8 -1 -9.6 1.6"
      stroke="#B4AC9C"
      strokeWidth="1"
      fill="none"
      strokeLinecap="round"
    />
    <ellipse cx="0" cy="0" rx="5.4" ry="3.4" fill="#9AA5B1" />
    <circle cx="5" cy="-1.2" r="2.2" fill="#B4BEC8" />
    <circle cx="5.8" cy="-1.8" r="0.5" fill="#3E2C22" />
  </g>
);

const Zzz = () => (
  <g stroke="#8D98A5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
    <path d="M14.5 10 H18 L14.5 5.5 H18" className="animate-vq-rise" style={{ transformBox: "fill-box" }} />
    <path
      d="M21.5 5 H24.5 L21.5 0.5 H24.5"
      className="animate-vq-rise"
      style={{ animationDelay: "700ms", transformBox: "fill-box" }}
    />
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
  const [pouncing, setPouncing] = useState(false);
  const [mouse, setMouse] = useState(false);
  const [dodging, setDodging] = useState(false);
  const [carrying, setCarrying] = useState(false);
  const [sleepy, setSleepy] = useState(false);
  const [yarnX, setYarnX] = useState<number | null>(null);
  const [cuddles] = useStoredState<number>(STORAGE_KEYS.kottonCuddles, 0);
  const [caught, setCaught] = useStoredState<number>(STORAGE_KEYS.kottonCaught, 0);
  const [soundOn, setSoundOn] = useStoredState<boolean>(STORAGE_KEYS.kottonSound, true);

  const idleTimer = useRef<number | undefined>(undefined);
  const sleepTimer = useRef<number | undefined>(undefined);
  const timers = useRef<number[]>([]);
  const audioRef = useRef<AudioContext | null>(null);
  const night = useIsNight();

  const xp = cuddles + caught * 5;
  const level = Math.floor(xp / 100) + 1;
  const into = xp % 100;
  const title = AFFECTION_TITLES[Math.min(AFFECTION_TITLES.length - 1, level - 1)];

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };


  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const { catX, moving, walkDir, walkMs, walkTo, xRef, arrived } = useKottonWalk({
    room: "play",
    getInitialX: () => readKottonPos().x,
  });

  useEffect(() => {
    const pos = readKottonPos();
    if (pos.room !== "play") {
      walkTo(1260, travelMs(xRef.current, 1260));
    }
  }, [walkTo, xRef]);

  const ensureAudio = () => {
    if (!soundOn) return null;
    if (!audioRef.current) {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      audioRef.current = new Ctx();
    }
    if (audioRef.current.state === "suspended") void audioRef.current.resume();
    return audioRef.current;
  };

  useEffect(
    () => () => {
      clearTimers();
      [idleTimer, sleepTimer].forEach((timer) => {
        if (timer.current !== undefined) window.clearTimeout(timer.current);
      });
      void audioRef.current?.close().catch(() => undefined);
    },
    []
  );

  const blip = (from: number, to: number, dur = 180, type: OscillatorType = "sine") => {
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), ctx.currentTime + dur / 1000);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur / 1000);
  };

  const resetIdle = () => {
    if (idleTimer.current !== undefined) window.clearTimeout(idleTimer.current);
    if (sleepTimer.current !== undefined) window.clearTimeout(sleepTimer.current);
    if (sleepy) {
      setSleepy(false);
      setPouncing(true);
      blip(400, 700, 140);
      later(() => setPouncing(false), 450);
    }
    idleTimer.current = window.setTimeout(() => {
      walkTo(1380);
      sleepTimer.current = window.setTimeout(() => setSleepy(true), WALK_MS + 120);
    }, 30000);
  };

  const stopPlaying = () => {
    clearTimers();
    setYarnX(null);
    setMouse(false);
    setDodging(false);
    setPouncing(false);
  };



  const chaseMouse = () => {
    stopPlaying();
    resetIdle();
    setMouse(true);
    const attempt = (target: number, remaining: number) => {
      walkTo(target);
      later(() => {
        if (remaining > 0) {
          setDodging(true);
          const next = pickSpot(IDLE_SPOTS, target);
          walkTo(next);
          later(() => {
            setDodging(false);
            attempt(next, remaining - 1);
          }, WALK_MS + 100);
          return;
        }
        setPouncing(true);
        navigator.vibrate?.(12);
        blip(600, 900, 180);
        setCaught((c) => c + 1);
        later(() => setPouncing(false), 700);
        if (level >= 3) {
          later(() => {
            setCarrying(true);
            later(() => setCarrying(false), 1600);
          }, 600);
        }
        later(() => setMouse(false), 1600);
      }, WALK_MS + 60);
    };
    attempt(pickSpot(IDLE_SPOTS, xRef.current), Math.random() < 0.5 ? 1 : 0);
  };

  const throwYarn = () => {
    stopPlaying();
    resetIdle();
    const first = 1120 + Math.random() * 280;
    setYarnX(first);
    blip(200, 400, 150, "triangle");
    const chaseStep = (target: number, round: number) => {
      walkTo(target);
      later(() => {
        setPouncing(true);
        navigator.vibrate?.(12);
        const next = Math.max(
          1110,
          Math.min(1410, target + (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 60))
        );
        setYarnX(next);
        blip(220, 420, 140, "triangle");
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

  const facing: CatFacing = moving || pouncing ? walkDir : "front";
  const catPose = moving
    ? "animate-vq-walk"
    : pouncing
      ? "animate-vq-pounce"
      : undefined;
  const camLeft = Math.max(0, Math.min(1640, catX - 80));

  const caption = carrying
    ? "Kotton rapporte sa prise !"
    : dodging
      ? "La souris file !"
      : sleepy
        ? "Kotton fait une sieste 💤"
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
      <SwipeZone>
        <div className="relative h-[38vh] max-h-[420px] min-h-[300px] overflow-hidden rounded-2xl border-2 border-accent bg-[#EAD8B4]">
        <HouseWorld
          night={night}
          activeRoom="play"
          camLeft={camLeft}
          catX={catX}
          moving={moving}
          walkMs={walkMs}
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
                  sleepy={sleepy}
                  excited={moving || pouncing || yarnX !== null || mouse}
                  facing={facing}
                  moving={moving}
                  arriving={arrived}
                />
                {sleepy ? <Zzz /> : null}
                {carrying ? (
                  <g transform={facing === "right" ? "translate(46 26)" : "translate(18 26)"}>
                    <CarriedMouse />
                  </g>
                ) : null}
                {mouse ? <ToyMouse flip={walkDir === "left"} /> : null}
              </g>
            </g>
          </g>
        </HouseWorld>

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

        <div className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
          🧡 {cuddles} câlins
        </div>

        <button
          type="button"
          onClick={() => {
            const next = !soundOn;
            setSoundOn(next);
            if (next) blip(500, 700, 120);
          }}
          className="absolute right-2 top-2 z-10 rounded-full bg-surface/90 px-2.5 py-1 text-sm shadow active:opacity-80"
          aria-label={soundOn ? "Couper le son" : "Activer le son"}
        >
          {soundOn ? "🔊" : "🔇"}
        </button>

        {caption ? (
          <div className="pointer-events-none absolute inset-x-6 top-2 z-10 flex justify-center">
            <span className="animate-vq-float rounded-full bg-[#221D17]/90 px-3 py-1 text-[11px] font-semibold text-[#FFF9F2]">
              {caption}
            </span>
          </div>
        ) : null}
        </div>
      </SwipeZone>

      <div className="rounded-xl border border-line bg-surface px-4 py-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span>
            Niveau {level} · {title}
          </span>
          <span className="text-muted">{into}/100</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-accent-soft">
          <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${into}%` }} />
        </div>
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
        Glisse la scène vers la gauche ou la droite pour changer de module.
      </p>
    </div>
  );
}
