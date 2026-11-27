import type { CSSProperties } from "react";

import { GingerCat } from "./cat";

export type Activity =
  | "idle"
  | "sweep"
  | "vacuum"
  | "dishes"
  | "litter"
  | "laundry"
  | "dust"
  | "windows"
  | "trash"
  | "garden"
  | "tidy";

export type SceneParticle = {
  id: number;
  emoji: string;
  drift: number;
  delay: number;
};

const ACTIVITY_CAPTIONS: Record<Activity, string> = {
  idle: "Kotton surveille la maison…",
  sweep: "Kotton passe le balai !",
  vacuum: "Kotton pousse le robot aspirateur !",
  dishes: "Kotton fait la vaisselle !",
  litter: "Kotton s'occupe de sa litière !",
  laundry: "Kotton trie le linge !",
  dust: "Kotton chasse la poussière !",
  windows: "Kotton brille les vitres !",
  trash: "Kotton sort les poubelles !",
  garden: "Kotton bichonne la terrasse !",
  tidy: "Kotton range la maison !",
};

const DUST_MOTES = [
  { left: 8, bottom: 34, delay: 0, drift: 10, size: 3 },
  { left: 16, bottom: 52, delay: 0.8, drift: -12, size: 2 },
  { left: 26, bottom: 42, delay: 1.6, drift: 14, size: 3 },
  { left: 34, bottom: 60, delay: 0.4, drift: -8, size: 2 },
  { left: 44, bottom: 36, delay: 2.2, drift: 12, size: 3 },
  { left: 52, bottom: 55, delay: 1.1, drift: -14, size: 2 },
  { left: 60, bottom: 44, delay: 2.8, drift: 10, size: 3 },
  { left: 68, bottom: 62, delay: 0.6, drift: -10, size: 2 },
  { left: 76, bottom: 38, delay: 1.9, drift: 12, size: 3 },
  { left: 84, bottom: 50, delay: 1.4, drift: -12, size: 2 },
  { left: 92, bottom: 40, delay: 2.5, drift: 8, size: 3 },
  { left: 12, bottom: 70, delay: 3.1, drift: 10, size: 2 },
];

const STARS = [
  { left: 10, top: 8, delay: 0 },
  { left: 22, top: 18, delay: 0.7 },
  { left: 38, top: 6, delay: 1.3 },
  { left: 50, top: 14, delay: 0.4 },
  { left: 64, top: 9, delay: 1.8 },
  { left: 78, top: 20, delay: 0.9 },
  { left: 88, top: 7, delay: 1.5 },
];

const CELEBRATION = [
  { left: 4, delay: 0, emoji: "✨" },
  { left: 12, delay: 180, emoji: "🫧" },
  { left: 20, delay: 90, emoji: "🐾" },
  { left: 28, delay: 260, emoji: "🌟" },
  { left: 36, delay: 40, emoji: "✨" },
  { left: 44, delay: 320, emoji: "🧹" },
  { left: 52, delay: 150, emoji: "🫧" },
  { left: 60, delay: 220, emoji: "✨" },
  { left: 68, delay: 60, emoji: "🐾" },
  { left: 76, delay: 300, emoji: "🌟" },
  { left: 84, delay: 120, emoji: "✨" },
  { left: 92, delay: 240, emoji: "🫧" },
  { left: 48, delay: 380, emoji: "✨" },
  { left: 30, delay: 420, emoji: "🌟" },
];

const FLOOR_SPARKLES = [
  { left: 24, delay: 0 },
  { left: 56, delay: 550 },
  { left: 82, delay: 1100 },
];

const SINK_BUBBLES = [
  { left: 4, delay: 0, size: "text-sm" },
  { left: 16, delay: 500, size: "text-base" },
  { left: -6, delay: 1000, size: "text-xs" },
];

const SINK_DROPS = [
  { left: 40, delay: 0 },
  { left: 50, delay: 450 },
];

const VACUUM_DIRT = [
  { left: 10, delay: 200 },
  { left: 22, delay: 800 },
];

const SAND_MOTES = [
  { left: 2, delay: 0 },
  { left: 18, delay: 220 },
  { left: -12, delay: 440 },
];

const BroomProp = () => (
  <svg viewBox="0 0 40 90" className="animate-vq-sweeping h-20 w-9">
    <path d="M20 4 L 20 52" stroke="#C96F2B" strokeWidth="5" strokeLinecap="round" />
    <path d="M12 52 L 28 52 L 32 82 L 8 82 Z" fill="#F6B39B" />
    <path d="M8 74 L 32 74" stroke="#C96F2B" strokeWidth="3" />
    <path d="M10 82 L 12 88 M 16 82 L 17 89 M 22 82 L 23 89 M 28 82 L 30 88" stroke="#C96F2B" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const VacuumProp = () => (
  <svg viewBox="0 0 90 34" className="animate-vq-vacuum h-8 w-20">
    <ellipse cx="45" cy="24" rx="40" ry="9" fill="#3E2C22" />
    <ellipse cx="45" cy="20" rx="40" ry="9" fill="#FF7000" />
    <ellipse cx="45" cy="20" rx="26" ry="5.5" fill="#FFE9D6" />
    <circle cx="45" cy="20" r="3" fill="#221D17" />
    <path d="M12 20 Q 20 14 30 18" stroke="#FFE9D6" strokeWidth="2" fill="none" />
    <path d="M60 20 Q 68 14 78 18" stroke="#FFE9D6" strokeWidth="2" fill="none" />
  </svg>
);

const SinkProp = () => (
  <svg viewBox="0 0 110 70" className="h-16 w-24">
    <rect x="4" y="38" width="102" height="24" rx="8" fill="#FFF" stroke="#ECDFD0" strokeWidth="3" />
    <rect x="30" y="50" width="50" height="12" rx="5" fill="#ECDFD0" />
    <path d="M55 10 L 55 22 Q 55 30 47 30" stroke="#8D8071" strokeWidth="6" strokeLinecap="round" fill="none" />
    <circle cx="45" cy="32" r="3" fill="#8D8071" />
    <rect
      x="42"
      y="33"
      width="6"
      height="12"
      rx="3"
      fill="#7FB5D6"
      className="animate-vq-stream"
    />
    <rect x="66" y="28" width="26" height="10" rx="4" fill="#FF7000" />
    <rect x="70" y="24" width="18" height="4" rx="2" fill="#FF8A33" />
  </svg>
);

const LitterBoxProp = () => (
  <svg viewBox="0 0 110 60" className="h-14 w-24">
    <path d="M8 22 L 102 22 L 94 54 L 16 54 Z" fill="#FF7000" />
    <path d="M12 28 L 98 28 L 92 50 L 18 50 Z" fill="#FFE9D6" />
    <ellipse cx="55" cy="36" rx="28" ry="7" fill="#ECDFD0" />
    <circle cx="45" cy="35" r="4" fill="#C96F2B" opacity="0.6" />
    <circle cx="64" cy="38" r="3.4" fill="#C96F2B" opacity="0.6" />
  </svg>
);

const DusterProp = () => (
  <svg viewBox="0 0 50 90" className="animate-vq-duster h-20 w-11">
    <path d="M25 20 L 25 86" stroke="#C96F2B" strokeWidth="5" strokeLinecap="round" />
    <path d="M25 20 Q 6 12 10 2 Q 20 8 25 12 Q 30 8 40 2 Q 44 12 25 20" fill="#F6B39B" />
    <path d="M25 20 Q 14 8 16 2" stroke="#E0705A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M25 20 Q 36 8 34 2" stroke="#E0705A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </svg>
);

type CatSceneProps = {
  progress: number;
  complete: boolean;
  celebrating: boolean;
  activity: Activity;
  activityKey: number;
  hopKey: number;
  particles: SceneParticle[];
};

export function CatScene({
  progress,
  complete,
  celebrating,
  activity,
  activityKey,
  hopKey,
  particles,
}: CatSceneProps) {
  const hour = new Date().getHours();
  const night = hour >= 20 || hour < 7;
  const dirt = complete ? 0 : 1 - progress;
  const active = activity !== "idle";
  const sleeping = night && !active && !complete;
  const catPose = !active
    ? undefined
    : activity === "sweep" || activity === "dust" || activity === "windows"
      ? "animate-vq-lean"
      : activity === "litter"
        ? "animate-vq-dig"
        : "animate-vq-bob";

  return (
    <div className="relative h-[38vh] max-h-[420px] min-h-[280px] overflow-hidden rounded-t-2xl border-2 border-b-0 border-accent bg-gradient-to-b from-accent-soft to-raised">
      {night ? (
        <>
          {STARS.map((star, index) => (
            <span
              key={index}
              className="animate-vq-shine absolute text-[8px]"
              style={{ left: `${star.left}%`, top: `${star.top}%`, animationDelay: `${star.delay}s` }}
              aria-hidden
            >
              ✦
            </span>
          ))}
          <span className="absolute left-6 top-4 text-4xl" aria-hidden>
            🌙
          </span>
        </>
      ) : (
        <>
          <span className="absolute left-6 top-3 text-5xl" aria-hidden>
            ☀️
          </span>
          <span
            className="animate-vq-float absolute right-10 top-8 text-3xl opacity-70"
            style={{ animationDuration: "5s" }}
            aria-hidden
          >
            ☁️
          </span>
          <span
            className="animate-vq-float absolute right-32 top-16 text-2xl opacity-50"
            style={{ animationDuration: "6.5s", animationDelay: "1.2s" }}
            aria-hidden
          >
            ☁️
          </span>
        </>
      )}

      <div className="absolute right-4 top-4 h-16 w-20 overflow-hidden rounded-md border-4 border-surface bg-canvas/80">
        <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-surface" />
        <div className="absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 bg-surface" />
        {complete ? (
          <span className="animate-vq-twinkle absolute bottom-1 left-2 text-xs" aria-hidden>
            ✨
          </span>
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[26%] border-t-2 border-line bg-line/50" />
      <div className="absolute bottom-[7%] left-6 h-9 w-44 rounded-[50%] border-2 border-accent/40 bg-accent-soft" />
      <span className="absolute bottom-[22%] right-3 text-4xl" aria-hidden>
        🪴
      </span>
      <span className="absolute bottom-[20%] right-16 text-2xl" aria-hidden>
        🧺
      </span>

      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{ opacity: dirt }}
        aria-hidden
      >
        {DUST_MOTES.map((mote, index) => (
          <span
            key={index}
            className="animate-vq-particle absolute rounded-full bg-muted"
            style={
              {
                left: `${mote.left}%`,
                bottom: `${mote.bottom}%`,
                width: mote.size,
                height: mote.size,
                animationDelay: `${mote.delay}s`,
                animationDuration: "5.5s",
                "--vq-drift": `${mote.drift}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {complete
        ? FLOOR_SPARKLES.map((sparkle, index) => (
            <span
              key={index}
              className="animate-vq-twinkle absolute bottom-[13%] text-2xl"
              style={{ left: `${sparkle.left}%`, animationDelay: `${sparkle.delay}ms` }}
              aria-hidden
            >
              ✨
            </span>
          ))
        : null}

      <div className="absolute bottom-[13%] left-4 flex items-end gap-1">
        <div key={`hop-${hopKey}`} className={hopKey > 0 ? "animate-vq-hop" : undefined}>
          <div key={activityKey} className={catPose}>
            <GingerCat
              happy={complete}
              sleepy={sleeping}
              excited={active}
              className="size-32 drop-shadow-md"
            />
          </div>
        </div>
        {sleeping ? (
          <div className="relative" aria-hidden>
            <span className="animate-vq-rise absolute -top-8 left-0 text-sm">💤</span>
            <span
              className="animate-vq-rise absolute -top-10 left-5 text-xs"
              style={{ animationDelay: "700ms" }}
            >
              💤
            </span>
          </div>
        ) : null}
        {activity === "sweep" ? (
          <BroomProp />
        ) : null}
        {activity === "dust" ? <DusterProp /> : null}
        {activity === "vacuum" ? (
          <div className="relative -ml-4">
            <VacuumProp />
            <span
              className="animate-vq-particle absolute -left-4 bottom-1 text-xs"
              style={{ animationDelay: "300ms" }}
              aria-hidden
            >
              🫧
            </span>
            {VACUUM_DIRT.map((speck, index) => (
              <span
                key={index}
                className="animate-vq-twinkle absolute -bottom-0.5 size-1.5 rounded-full bg-muted"
                style={{ left: `${speck.left}px`, animationDelay: `${speck.delay}ms` }}
                aria-hidden
              />
            ))}
          </div>
        ) : null}
        {activity === "dishes" ? (
          <div className="relative">
            <SinkProp />
            {SINK_DROPS.map((drop, index) => (
              <span
                key={index}
                className="animate-vq-drip absolute top-11 text-[10px]"
                style={{ left: `${drop.left}px`, animationDelay: `${drop.delay}ms` }}
                aria-hidden
              >
                💧
              </span>
            ))}
            {SINK_BUBBLES.map((bubble, index) => (
              <span
                key={index}
                className={`animate-vq-rise absolute bottom-6 ${bubble.size}`}
                style={{ left: `${bubble.left}px`, animationDelay: `${bubble.delay}ms` }}
                aria-hidden
              >
                🫧
              </span>
            ))}
          </div>
        ) : null}
        {activity === "litter" ? (
          <div className="relative">
            <LitterBoxProp />
            {SAND_MOTES.map((mote, index) => (
              <span
                key={index}
                className="animate-vq-particle absolute bottom-8 text-[10px]"
                style={{ left: `${mote.left}px`, animationDelay: `${mote.delay}ms` }}
                aria-hidden
              >
                🐾
              </span>
            ))}
          </div>
        ) : null}
        {activity === "laundry" ? (
          <div className="relative text-3xl">
            <span className="animate-vq-tumble absolute -top-6 left-2" aria-hidden>
              🧦
            </span>
            <span
              className="animate-vq-tumble absolute -top-8 left-9 text-2xl"
              style={{ animationDelay: "400ms" }}
              aria-hidden
            >
              👕
            </span>
          </div>
        ) : null}
        {activity === "trash" || activity === "tidy" ? (
          <span
            className="animate-vq-twinkle text-3xl"
            style={{ animationDelay: "200ms" }}
            aria-hidden
          >
            {activity === "trash" ? "🗑️" : "📦"}
          </span>
        ) : null}
        {activity === "garden" ? (
          <>
            <span className="animate-vq-particle text-2xl" aria-hidden>
              🍃
            </span>
            <span
              className="animate-vq-particle text-xl"
              style={{ animationDelay: "350ms", "--vq-drift": "18px" } as CSSProperties}
              aria-hidden
            >
              🍃
            </span>
          </>
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[30%] flex justify-center">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="animate-vq-particle absolute text-2xl"
            style={
              {
                "--vq-drift": `${particle.drift}px`,
                animationDelay: `${particle.delay}ms`,
              } as CSSProperties
            }
            aria-hidden
          >
            {particle.emoji}
          </span>
        ))}
      </div>

      {active ? (
        <div className="animate-vq-float absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-ink/90 px-3 py-1 text-[11px] font-semibold text-canvas">
          {ACTIVITY_CAPTIONS[activity]}
        </div>
      ) : null}
      {sleeping ? (
        <div className="animate-vq-float absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-ink/90 px-3 py-1 text-[11px] font-semibold text-canvas">
          Chut… Kotton dort. 💤
        </div>
      ) : null}

      {celebrating ? (
        <>
          {CELEBRATION.map((particle, index) => (
            <span
              key={index}
              className="animate-vq-celebrate absolute top-0 text-2xl"
              style={{ left: `${particle.left}%`, animationDelay: `${particle.delay}ms` }}
              aria-hidden
            >
              {particle.emoji}
            </span>
          ))}
          <div className="animate-vq-float absolute inset-x-8 top-1/2 -translate-y-1/2 rounded-xl bg-accent px-4 py-2 text-center text-sm font-bold text-white shadow-lg">
            🏆 Mission accomplie ! Kotton est fier de vous ✨
          </div>
        </>
      ) : null}

    </div>
  );
}
