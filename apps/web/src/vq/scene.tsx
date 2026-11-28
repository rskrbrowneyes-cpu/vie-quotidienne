import { memo, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { Kotton } from "./cat";
import type { CatAction, CatFacing } from "./cat";
import { useIsNight } from "./clock";
import {
  STORAGE_KEYS,
  computeXp,
  levelFromXp,
  rankTitle,
  useStoredState,
} from "./storage";
import type { ChoreHistoryEntry } from "./storage";
import {
  ROOM_OFFSET,
  WALK_MS,
  pickSpot,
  readKottonPos,
  travelMs,
  useKottonWalk,
} from "./walk";
import type { HouseRoom } from "./walk";

export { ROOM_OFFSET, readKottonPos, saveKottonPos, travelMs } from "./walk";
export type { HouseRoom, KottonPos } from "./walk";

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

export type ParticleKind = "sq" | "bub" | "star";

export type ParticleSpec = { kind: ParticleKind; color: string };

export type SceneParticle = {
  id: number;
  kind: ParticleKind;
  color: string;
  drift: number;
  delay: number;
};

export type HouseEvent = {
  kind: "none" | "task" | "habit" | "budget";
  ts: number;
  big?: boolean;
};

const ACTIVITY_CAPTIONS: Record<Activity, string> = {
  idle: "Kotton surveille la maison…",
  sweep: "Kotton passe le balai !",
  vacuum: "Kotton lance le robot aspirateur !",
  dishes: "Kotton fait la vaisselle !",
  litter: "Kotton s'occupe de sa litière !",
  laundry: "Kotton trie le linge !",
  dust: "Kotton chasse la poussière !",
  windows: "Kotton brille les vitres !",
  trash: "Kotton sort les poubelles !",
  garden: "Kotton bichonne la terrasse !",
  tidy: "Kotton range la maison !",
};

const TARGET_X: Record<Activity, number> = {
  idle: 120,
  dishes: 44,
  sweep: 100,
  vacuum: 84,
  dust: 112,
  litter: 224,
  laundry: 158,
  trash: 326,
  garden: 300,
  windows: 268,
  tidy: 100,
};

const LIVING = 1080;

const CAM_MAX = 1640;

const IDLE_SPOTS = [1176, 1202, 1236, 1276, 1312, 1348];

const MOUSE_SPOTS = IDLE_SPOTS;

const DUST_MOTES = [
  { left: 8, bottom: 36, delay: 0, drift: 10, size: 3 },
  { left: 18, bottom: 54, delay: 0.8, drift: -12, size: 2 },
  { left: 28, bottom: 44, delay: 1.6, drift: 14, size: 3 },
  { left: 38, bottom: 62, delay: 0.4, drift: -8, size: 2 },
  { left: 48, bottom: 38, delay: 2.2, drift: 12, size: 3 },
  { left: 58, bottom: 56, delay: 1.1, drift: -14, size: 2 },
  { left: 66, bottom: 46, delay: 2.8, drift: 10, size: 3 },
  { left: 74, bottom: 64, delay: 0.6, drift: -10, size: 2 },
  { left: 82, bottom: 40, delay: 1.9, drift: 12, size: 3 },
  { left: 90, bottom: 52, delay: 1.4, drift: -12, size: 2 },
  { left: 95, bottom: 42, delay: 2.5, drift: 8, size: 3 },
  { left: 13, bottom: 70, delay: 3.1, drift: 10, size: 2 },
];

const CELEBRATION = [
  { left: 4, delay: 0, kind: "sq", color: "#FF7000" },
  { left: 12, delay: 180, kind: "star", color: "#FFE9D6" },
  { left: 20, delay: 90, kind: "sq", color: "#FFD9A8" },
  { left: 28, delay: 260, kind: "star", color: "#FF8A33" },
  { left: 36, delay: 40, kind: "sq", color: "#FFE9D6" },
  { left: 44, delay: 320, kind: "sq", color: "#FF7000" },
  { left: 52, delay: 150, kind: "star", color: "#FFD9A8" },
  { left: 60, delay: 220, kind: "sq", color: "#FF8A33" },
  { left: 68, delay: 60, kind: "star", color: "#FFE9D6" },
  { left: 76, delay: 300, kind: "sq", color: "#FFD9A8" },
  { left: 84, delay: 120, kind: "sq", color: "#FF7000" },
  { left: 92, delay: 240, kind: "star", color: "#FF8A33" },
  { left: 48, delay: 380, kind: "sq", color: "#FFE9D6" },
  { left: 30, delay: 420, kind: "star", color: "#FF7000" },
];

const TRIM = "#8B5E34";

export const StarPath = ({ x, y, s, delay }: { x: number; y: number; s: number; delay?: number }) => (
  <path
    d={`M${x} ${y - s} C${x + s * 0.2} ${y - s * 0.2} ${x + s * 0.2} ${y - s * 0.2} ${x + s} ${y} C${
      x + s * 0.2
    } ${y + s * 0.2} ${x + s * 0.2} ${y + s * 0.2} ${x} ${y + s} C${x - s * 0.2} ${y + s * 0.2} ${
      x - s * 0.2
    } ${y + s * 0.2} ${x - s} ${y} C${x - s * 0.2} ${y - s * 0.2} ${x - s * 0.2} ${y - s * 0.2} ${x} ${
      y - s
    } Z`}
    fill="#FFD97A"
    className="animate-vq-twinkle"
    style={{ animationDelay: delay ? `${delay}ms` : undefined }}
  />
);

const WindowBird = ({ night, windowsFx }: { night: boolean; windowsFx: boolean }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (night || windowsFx) return;
    const timers = new Set<number>();
    const interval = window.setInterval(() => {
      setVisible(true);
      timers.add(window.setTimeout(() => setVisible(false), 3000));
    }, 20000);
    return () => {
      window.clearInterval(interval);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [night, windowsFx]);

  if (night || windowsFx) return null;

  return (
    <g
      transform="translate(262 47.5)"
      className={`transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <g className="animate-vq-bob" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
        <ellipse cx="0" cy="-3" rx="3.2" ry="2.2" fill="#5E96C4" />
        <circle cx="2.8" cy="-4.6" r="1.8" fill="#3E5F7E" />
        <path d="M4.4 -4.6 L6.2 -4 L4.4 -3.6 Z" fill="#E0705A" />
        <circle cx="3.4" cy="-5" r="0.5" fill="#FFF4E8" />
        <path d="M-0.6 -1 V0.6 M0.8 -1 V0.6" stroke="#3E5F7E" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M-2.4 -2.6 Q-3.6 -3.4 -4.2 -2.2" stroke="#3E5F7E" strokeWidth="1" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

export const ToyMouse = ({ flip }: { flip: boolean }) => (
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

const ROOM_WALL: Record<HouseRoom, string> = {
  office: "#E2E8D3",
  kitchen: "#F2E7CF",
  laundry: "#DCE7EE",
  living: "#E9EDDA",
  play: "#F6E4D2",
};

const ROOM_WAINSCOT: Record<HouseRoom, string> = {
  office: "#C9D6BB",
  kitchen: "#E3D6BB",
  laundry: "#C3D4DE",
  living: "#C4D2B4",
  play: "#EBCDB4",
};

const RoomShell = ({ room, active }: { room: HouseRoom; active: boolean }) => (
  <g>
    <rect x="0" y="0" width="360" height="92" fill={ROOM_WALL[room]} />
    <rect x="0" y="0" width="360" height="92" fill="url(#vq-shade)" />
    <rect x="0" y="70" width="360" height="18" fill={ROOM_WAINSCOT[room]} />
    <rect x="0" y="70" width="360" height="1.2" fill="#3E2C22" opacity="0.15" />
    <rect x="0" y="88" width="360" height="4" fill="#D9B98C" />
    <rect x="0" y="92" width="360" height="28" fill="url(#vq-floor)" />
    {[98, 104, 110, 116].map((y) => (
      <rect key={y} x="0" y={y} width="360" height="0.8" fill="#9A6B3F" opacity="0.4" />
    ))}
    {[36, 88, 140, 196, 252, 308].map((x) => (
      <rect key={x} x={x} y="92.4" width="1" height="4.6" fill="#9A6B3F" opacity="0.45" />
    ))}
    <rect x="0" y="92" width="360" height="5" fill="url(#vq-ao)" />
    {active ? (
      <g>
        <line x1="176" y1="0" x2="176" y2="12" stroke="#3E2C22" strokeWidth="1" />
        <circle cx="176" cy="22" r="16" fill="url(#vq-sun)" opacity="0.5" />
        <path d="M168 12 L184 12 L180 20 L172 20 Z" fill={TRIM} />
      </g>
    ) : null}
    <rect
      x="0"
      y="0"
      width="360"
      height="92"
      fill="#3E2C22"
      opacity={active ? 0 : 0.07}
      className="transition-opacity duration-700"
    />
  </g>
);

const Doorway = ({ x }: { x: number }) => (
  <g>
    <rect x={x - 10} y="18" width="20" height="74" fill="#4A3A2C" opacity="0.5" />
    <rect x={x - 14} y="10" width="28" height="8" rx="1" fill={TRIM} />
    <rect x={x - 14} y="10" width="4" height="82" fill={TRIM} />
    <rect x={x + 10} y="10" width="4" height="82" fill={TRIM} />
  </g>
);

const OfficeDecor = ({ taskFx, night }: { taskFx: boolean; night: boolean }) => (
  <g>
    <rect x="60" y="10" width="44" height="48" rx="3" fill={TRIM} />
    <g className={`transition-opacity duration-1000 ${night ? "opacity-100" : "opacity-0"}`}>
      <rect x="64" y="14" width="36" height="40" rx="2" fill="#263149" />
      <circle cx="90" cy="24" r="5" fill="#FFF3C2" />
      <circle cx="74" cy="20" r="0.8" fill="#FFF" className="animate-vq-shine" />
      <circle cx="82" cy="34" r="0.8" fill="#FFF" className="animate-vq-shine" style={{ animationDelay: "1.2s" }} />
    </g>
    <g className={`transition-opacity duration-1000 ${night ? "opacity-0" : "opacity-100"}`}>
      <rect x="64" y="14" width="36" height="40" rx="2" fill="#A5D8EC" />
      <circle cx="76" cy="24" r="4.6" fill="#FFD97A" />
      <path d="M64 46 Q76 38 88 42 Q96 44 100 42 L100 54 L64 54 Z" fill="#9BC77E" />
    </g>
    <rect x="64" y="32" width="36" height="1.4" fill={TRIM} opacity="0.7" />

    <rect x="130" y="18" width="42" height="30" rx="2" fill="#C9A876" />
    <rect x="133" y="21" width="36" height="24" rx="1" fill="#D9B98C" />
    <rect x="136" y="24" width="9" height="7" rx="1" fill="#E86A8A" />
    <rect x="149" y="25" width="8" height="9" rx="1" fill="#7FB5D6" />
    <rect x="160" y="23" width="9" height="8" rx="1" fill="#A8C686" />
    <circle cx="140.5" cy="24.5" r="0.8" fill="#E0705A" />
    <circle cx="153" cy="25.5" r="0.8" fill="#3E2C22" />
    <circle cx="164.5" cy="23.5" r="0.8" fill="#FFD97A" />
    <g className="animate-vq-bob" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
      <rect x="140" y="36" width="12" height="8" rx="1" fill="#FFF9F2" transform="rotate(-4 146 40)" />
    </g>

    <rect x="210" y="52" width="72" height="4" rx="2" fill="#B08A5A" />
    <rect x="214" y="56" width="64" height="30" fill="#C9A876" />
    <rect x="214" y="56" width="64" height="3" fill="#B08A5A" />
    <line x1="246" y1="59" x2="246" y2="86" stroke="#B08A5A" strokeWidth="1.2" />
    <circle cx="230" cy="70" r="1" fill="#8B6B42" />
    <circle cx="262" cy="70" r="1" fill="#8B6B42" />
    <rect x="252" y="26" width="19" height="26" rx="1.6" fill="#3E2C22" />
    <path d="M254 29 H269 V44 Q261.5 41 254 44 Z" fill="#7FB5D6" />
    <rect x="238" y="48" width="6" height="4" rx="1" fill="#8D98A5" />
    <rect x="284" y="46" width="16" height="3" rx="1.5" fill="#C9A876" />
    <rect x="286" y="49" width="2.4" height="37" fill="#B08A5A" />
    <rect x="297.6" y="49" width="2.4" height="37" fill="#B08A5A" />

    <rect x="314" y="14" width="38" height="72" fill="#B08A5A" />
    {[22, 42, 62].map((y) => (
      <g key={y}>
        <rect x="316" y={y} width="34" height="2.4" fill="#D9B98C" />
        <rect x="318" y={y - 9} width="4" height="9" fill="#E86A8A" />
        <rect x="323" y={y - 7} width="4" height="7" fill="#7FB5D6" />
        <rect x="328" y={y - 8} width="4" height="8" fill="#A8C686" />
        <rect x="334" y={y - 6} width="4" height="6" fill="#FFD97A" />
        <rect x="340" y={y - 8.5} width="4" height="8.5" fill="#C96F2B" />
      </g>
    ))}

    {taskFx ? (
      <g>
        <path
          d="M238 34 L245 43 L259 22"
          fill="none"
          stroke="#5FA36B"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-vq-pop"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
        <StarPath x={232} y={30} s={2.4} />
        <StarPath x={262} y={24} s={2} delay={300} />
      </g>
    ) : null}
  </g>
);

const KitchenDecor = ({ budgetFx, budgetBig }: { budgetFx: boolean; budgetBig: boolean }) => (
  <g>
    <rect x="24" y="14" width="92" height="22" rx="2" fill="#D8B98C" />
    <line x1="70" y1="14" x2="70" y2="36" stroke="#B08A5A" strokeWidth="1.2" />
    <circle cx="47" cy="25" r="1" fill="#8B6B42" />
    <circle cx="93" cy="25" r="1" fill="#8B6B42" />
    <rect x="78" y="20" width="3" height="10" rx="1" fill="#8FA6AD" />
    <rect x="83" y="22" width="2.6" height="8" rx="1" fill="#AFC3C9" />

    <rect x="22" y="52" width="104" height="5" rx="2" fill="#F2EDE2" />
    <rect x="26" y="57" width="96" height="29" fill="#D8B98C" />
    <line x1="74" y1="57" x2="74" y2="86" stroke="#B08A5A" strokeWidth="1.2" />
    <circle cx="50" cy="71" r="1" fill="#8B6B42" />
    <circle cx="98" cy="71" r="1" fill="#8B6B42" />
    <rect x="44" y="46" width="26" height="6" rx="2" fill="#3E2C22" />
    <g>
      <rect x="48" y="40" width="18" height="7" rx="2" fill="#8FA6AD" />
      <rect x="52" y="36" width="2" height="5" fill="#6C7A86" />
      <circle cx="64" cy="38" r="1.4" fill="#6C7A86" />
      <g className="animate-vq-rise" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
        <path d="M55 33 Q53 30 55 27 Q57 24 55 21" stroke="#FFF" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.75" />
      </g>
    </g>

    <rect x="150" y="20" width="38" height="66" rx="3" fill="#D7E4EC" />
    <line x1="150" y1="52" x2="188" y2="52" stroke="#BECFDB" strokeWidth="1.2" />
    <rect x="182" y="44" width="3" height="7" rx="1.5" fill="#8FA6AD" />
    <circle cx="158" cy="30" r="1.6" fill="#E86A8A" />
    <circle cx="166" cy="60" r="1.6" fill="#7FB5D6" />

    <rect x="210" y="18" width="54" height="40" rx="2" fill="#2E4034" />
    <text x="222" y="36" fontSize="12" fontWeight="bold" fill="#FFF9F2">€</text>
    <line x1="238" y1="30" x2="256" y2="30" stroke="#A8C686" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="238" y1="38" x2="252" y2="38" stroke="#A8C686" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="238" y1="46" x2="256" y2="46" stroke="#A8C686" strokeWidth="1.6" strokeLinecap="round" />

    <rect x="288" y="58" width="54" height="4" rx="2" fill="#B08A5A" />
    <rect x="292" y="62" width="46" height="3" fill="#A57F4E" />
    <rect x="294" y="65" width="4" height="21" fill="#B08A5A" />
    <rect x="332" y="65" width="4" height="21" fill="#B08A5A" />
    <g
      className={budgetBig ? "animate-vq-wobble" : undefined}
      style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
    >
      <ellipse cx="320" cy="57" rx="8" ry="7.4" fill="#F6B39B" />
      <rect x="318.6" y="49.4" width="2.8" height="2" rx="1" fill="#C96F2B" />
      <path d="M312.6 55.4 Q310.4 53.4 312 51.6" stroke="#C96F2B" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="317.4" cy="55.6" r="0.7" fill="#3E2C22" />
      <circle cx="322.6" cy="55.6" r="0.7" fill="#3E2C22" />
      <ellipse cx="320" cy="58.4" rx="2.2" ry="1.6" fill="#E0705A" />
    </g>
    {budgetFx ? (
      <g>
        <circle
          cx="319.5"
          cy="42"
          r="2.8"
          fill="#FFD97A"
          stroke="#C9A227"
          strokeWidth="0.8"
          className="animate-vq-drop-in"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
        <StarPath x={312} y={40} s={2.2} />
        <StarPath x={328} y={44} s={1.8} delay={350} />
      </g>
    ) : null}
  </g>
);

const LaundryDecor = ({ habitFx }: { habitFx: boolean }) => (
  <g>
    <rect x="36" y="56" width="46" height="34" rx="3" fill="#BECFDB" />
    <rect x="36" y="56" width="46" height="8" rx="3" fill="#AFC3C9" />
    <circle cx="59" cy="70" r="13" fill="#8FA6AD" />
    <circle cx="59" cy="70" r="10" fill="#A5D8EC" />
    <g className="animate-vq-scrub" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
      <path d="M52 70 Q55.5 67.6 59 70 Q62.5 72.4 66 70" stroke="#FFF" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
    <circle cx="45" cy="61.4" r="1" fill="#7FB5B0" className="animate-vq-shine" />
    <rect x="41" y="83" width="10" height="3" rx="1.5" fill="#8FA6AD" />

    <rect x="106" y="30" width="44" height="3" rx="1.5" fill="#B08A5A" />
    <rect x="110" y="18" width="6" height="12" rx="2" fill="#7FB5D6" />
    <rect x="118" y="20" width="6" height="10" rx="2" fill="#F6B39B" />
    <rect x="126" y="17" width="7" height="13" rx="2" fill="#A8C686" />
    <rect x="136" y="21" width="6" height="9" rx="2" fill="#FFD97A" />

    <path d="M170 78 Q168 90 172 91 L192 91 Q196 90 194 78 Z" fill="#C9A876" />
    <rect x="169" y="75.6" width="26" height="4" rx="2" fill="#D8B98C" />

    <rect x="190" y="20" width="66" height="48" rx="2" fill={TRIM} />
    <rect x="194" y="24" width="58" height="40" rx="1" fill="#FFF9F2" />
    <rect x="194" y="24" width="58" height="9" fill="#FFE9D6" />
    <g stroke="#ECDFD0" strokeWidth="1">
      <line x1="194" y1="36" x2="252" y2="36" />
      <line x1="194" y1="48" x2="252" y2="48" />
      <line x1="213" y1="33" x2="213" y2="64" />
      <line x1="232" y1="33" x2="232" y2="64" />
    </g>
    <rect x="197" y="37" width="13" height="9" rx="1.5" fill="#FF7000" />
    <rect x="216" y="37" width="13" height="9" rx="1.5" fill="#FF7000" />
    <rect x="235" y="37" width="13" height="9" rx="1.5" fill="#FF7000" />
    <rect x="197" y="49" width="13" height="9" rx="1.5" fill="#FF7000" />
    <rect x="216" y="49" width="13" height="9" rx="1.5" fill="#FF7000" />

    <line x1="282" y1="24" x2="338" y2="24" stroke="#8FA6AD" strokeWidth="1.4" />
    <line x1="284" y1="24" x2="284" y2="44" stroke="#8FA6AD" strokeWidth="1.2" />
    <line x1="336" y1="24" x2="336" y2="44" stroke="#8FA6AD" strokeWidth="1.2" />
    <g className="animate-vq-sway" style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}>
      <rect x="290" y="24" width="10" height="14" rx="1" fill="#7FB5D6" />
    </g>
    <g className="animate-vq-sway" style={{ transformBox: "fill-box", transformOrigin: "50% 0%", animationDelay: "700ms" }}>
      <rect x="306" y="24" width="12" height="16" rx="1" fill="#E86A8A" />
    </g>
    <g className="animate-vq-sway" style={{ transformBox: "fill-box", transformOrigin: "50% 0%", animationDelay: "350ms" }}>
      <rect x="322" y="24" width="9" height="12" rx="1" fill="#FFF9F2" />
    </g>

    {habitFx ? (
      <g>
        <rect
          x="235"
          y="49"
          width="13"
          height="9"
          rx="1.5"
          fill="#FF7000"
          className="animate-vq-bloom"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
        <StarPath x={206} y={14} s={2} />
        <StarPath x={228} y={12} s={2.4} delay={250} />
        <StarPath x={246} y={15} s={1.8} delay={500} />
        <circle cx="54" cy="66" r="1.2" fill="#FFF" className="animate-vq-rise" style={{ transformBox: "fill-box" }} />
        <circle cx="63" cy="64" r="0.9" fill="#FFF" className="animate-vq-rise" style={{ animationDelay: "300ms", transformBox: "fill-box" }} />
      </g>
    ) : null}
  </g>
);

const PlayDecor = () => (
  <g>
    <ellipse cx="180" cy="100" rx="60" ry="7" fill="#F6C9C4" />
    <ellipse cx="180" cy="99" rx="48" ry="5.4" fill="#F2B7B0" />

    <line x1="40" y1="12" x2="150" y2="12" stroke="#C96F2B" strokeWidth="1" />
    {[0, 1, 2, 3, 4].map((index) => (
      <path
        key={index}
        d={`M${52 + index * 18} 12 L${62 + index * 18} 12 L${57 + index * 18} 22 Z`}
        fill={index % 2 === 0 ? "#FF8A33" : "#7FB5D6"}
      />
    ))}

    <rect x="34" y="74" width="34" height="16" rx="3" fill="#C9A876" />
    <circle cx="44" cy="71" r="4" fill="#E06A8A" />
    <circle cx="54" cy="70" r="4.6" fill="#7FB5D6" />
    <circle cx="62" cy="72" r="3.6" fill="#A8C686" />

    <path d="M96 92 L96 76 Q104 68 112 76 L112 92 Z" fill="#3E2C22" />
    <g className="animate-vq-bob" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
      <ellipse cx="104" cy="88" rx="4.4" ry="2.8" fill="#9AA5B1" />
      <circle cx="108" cy="86.8" r="1.8" fill="#B4BEC8" />
    </g>

    <line x1="150" y1="0" x2="150" y2="14" stroke="#3E2C22" strokeWidth="0.8" />
    <g className="animate-vq-sway" style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}>
      <rect x="146" y="14" width="8" height="3" rx="1.5" fill="#C96F2B" />
      <path d="M147.6 17 L149 40 L151 40 L152.4 17 Z" fill="#D9B98C" />
    </g>

    <rect x="234" y="70" width="17" height="22" rx="2" fill="#C9A876" />
    <line x1="242" y1="70" x2="242" y2="92" stroke="#B08A5A" strokeWidth="1" />

    <rect x="262" y="30" width="62" height="3" rx="1.5" fill="#B08A5A" />
    <circle cx="270" cy="27" r="3.4" fill="#E86A8A" />
    <ellipse cx="288" cy="26.6" rx="5" ry="3" fill="#7FB5D6" />
    <path d="M293 26.6 L297 24 L297 29.2 Z" fill="#5E96C4" />
    <rect x="306" y="22" width="9" height="4" rx="2" fill="#FFD97A" />
    <circle cx="306" cy="24" r="1.8" fill="#FFD97A" />
    <circle cx="315" cy="24" r="1.8" fill="#FFD97A" />

    <ellipse cx="202" cy="90" rx="20" ry="5" fill="#E8938C" />
    <ellipse cx="202" cy="89" rx="16" ry="4" fill="#F2E7D2" />
  </g>
);

type LivingProps = {
  night: boolean;
  complete: boolean;
  dishesFx: boolean;
  vacuumFx: boolean;
  sweepFx: boolean;
  litterFx: boolean;
  laundryFx: boolean;
  trashFx: boolean;
  gardenFx: boolean;
  windowsFx: boolean;
};

const LivingDecor = ({
  night,
  complete,
  dishesFx,
  vacuumFx,
  sweepFx,
  litterFx,
  laundryFx,
  trashFx,
  gardenFx,
  windowsFx,
}: LivingProps) => (
  <g>
    <rect x="100" y="16" width="20" height="22" rx="2" fill={TRIM} />
    <rect x="103" y="19" width="14" height="16" rx="1" fill="#F2E7D2" />
    <path d="M103 31 Q108 25 112 28 Q116 31 117 29 L117 35 L103 35 Z" fill="#A8C686" />
    <circle cx="114" cy="23" r="2.2" fill="#FFD97A" />
    <rect x="96" y="46" width="32" height="3" rx="1.5" fill="#B08A5A" />
    <rect x="99" y="49" width="2" height="3" fill="#8B6B42" />
    <rect x="123" y="49" width="2" height="3" fill="#8B6B42" />
    <rect x="101" y="40.5" width="5" height="5.5" rx="1" fill="#C96F2B" />
    <ellipse cx="102.2" cy="38.6" rx="1.6" ry="2.6" fill="#6FA85A" transform="rotate(-20 102.2 38.6)" />
    <ellipse cx="104.8" cy="38.6" rx="1.6" ry="2.6" fill="#8BC34A" transform="rotate(20 104.8 38.6)" />
    <rect x="110" y="38" width="7" height="8" rx="1" fill="#7FB5D6" />
    <rect x="110" y="40.4" width="7" height="1" fill="#5E96C4" />
    <rect x="119" y="39.5" width="6" height="6.5" rx="1" fill="#E86A8A" />

    {night ? null : (
      <path d="M252 52 L286 52 L320 118 L272 118 Z" fill="url(#vq-shaft)" opacity="0.85" />
    )}

    <rect x="244" y="4" width="50" height="46" rx="4" fill={TRIM} />
    <g className={`transition-opacity duration-1000 ${night ? "opacity-100" : "opacity-0"}`}>
      <rect x="248" y="8" width="42" height="38" rx="2.5" fill="#263149" />
      <circle cx="254" cy="14" r="0.9" fill="#FFF" className="animate-vq-shine" />
      <circle cx="274" cy="12.5" r="0.9" fill="#FFF" className="animate-vq-shine" style={{ animationDelay: "1.1s" }} />
      <circle cx="282" cy="21" r="0.9" fill="#FFF" className="animate-vq-shine" style={{ animationDelay: "2.2s" }} />
      <circle cx="262" cy="34" r="0.9" fill="#FFF" className="animate-vq-shine" style={{ animationDelay: "0.7s" }} />
      <circle cx="278" cy="19" r="9" fill="url(#vq-moon)" />
      <circle cx="278" cy="19" r="5.2" fill="#FFF3C2" />
      <circle cx="276.2" cy="17.6" r="1.1" fill="#F0E0A8" />
      <circle cx="279.6" cy="20.6" r="0.8" fill="#F0E0A8" />
    </g>
    <g className={`transition-opacity duration-1000 ${night ? "opacity-0" : "opacity-100"}`}>
      <rect x="248" y="8" width="42" height="38" rx="2.5" fill="#A5D8EC" />
      <circle
        cx="260"
        cy="17"
        r="9.5"
        fill="url(#vq-sun)"
        className="animate-vq-glow"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
      <circle cx="260" cy="17" r="4.4" fill="#FFD97A" />
      <circle cx="260" cy="17" r="2.8" fill="#FFE9A8" />
      <g className="animate-vq-drift" style={{ animationDuration: "12s" }} fill="#FFF">
        <circle cx="270" cy="26" r="2.6" />
        <circle cx="274.5" cy="24.6" r="3.2" />
        <circle cx="279" cy="26.4" r="2.4" />
        <rect x="268" y="25.4" width="13.6" height="3.4" rx="1.7" />
      </g>
      <g
        className="animate-vq-drift"
        style={{ animationDuration: "9s", animationDelay: "2s" }}
        fill="#FFF"
        opacity="0.9"
      >
        <circle cx="276" cy="13" r="1.8" />
        <circle cx="279.5" cy="11.8" r="2.3" />
        <circle cx="283" cy="13.2" r="1.7" />
        <rect x="275" y="12.4" width="9.6" height="2.4" rx="1.2" />
      </g>
    </g>
    <rect x="267" y="8" width="2" height="38" fill={TRIM} opacity="0.8" />
    <rect x="248" y="25.5" width="42" height="2" fill={TRIM} opacity="0.8" />
    <rect x="242" y="48" width="54" height="4" rx="2" fill="#D9B98C" />
    <WindowBird night={night} windowsFx={windowsFx} />

    <ellipse cx="10" cy="40" rx="8" ry="13" fill="#B0C2A0" />
    <ellipse cx="10" cy="40" rx="6.6" ry="11.6" fill="#C8DCE8" />
    <path d="M6.4 46 Q9 38 12.8 34.6" stroke="#FFF" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.7" />

    <rect x="22" y="40" width="30" height="26" fill="#D7E4EC" />
    <g stroke="#BECFDB" strokeWidth="0.8">
      <path d="M22 46.5 H52" />
      <path d="M22 53 H52" />
      <path d="M22 59.5 H52" />
      <path d="M32 40 V66" />
      <path d="M42 40 V66" />
    </g>
    <rect x="23" y="64" width="28" height="24" rx="2" fill="#C9A876" />
    <rect x="23" y="64" width="28" height="2.4" rx="1.2" fill="#B08A5A" />
    <path d="M37 67 V87" stroke="#B08A5A" strokeWidth="1.2" />
    <circle cx="34.4" cy="76" r="1" fill="#8B6B42" />
    <circle cx="39.6" cy="76" r="1" fill="#8B6B42" />
    <rect x="21" y="60" width="32" height="5" rx="2" fill="#F2EDE2" />
    <rect x="27" y="61" width="16" height="3.2" rx="1.6" fill="#B9C6CE" />
    <path d="M44 60 V50 Q44 45.5 39.5 45.5 H36.5" stroke="#8FA6AD" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    {dishesFx ? (
      <>
        <rect x="35.6" y="46" width="1.3" height="13" fill="#7FB5D6" className="animate-vq-stream" />
        <ellipse cx="31" cy="60.4" rx="3.6" ry="1.3" fill="#FFFFFF" className="animate-vq-scrub" />
        <circle cx="28" cy="59.6" r="1.2" fill="#DFF1FA" className="animate-vq-scrub" />
        <circle cx="35" cy="60.8" r="1" fill="#DFF1FA" className="animate-vq-scrub" style={{ animationDelay: "250ms" }} />
        <circle cx="31.5" cy="58.6" r="0.8" fill="#DFF1FA" className="animate-vq-scrub" style={{ animationDelay: "500ms" }} />
      </>
    ) : null}

    {sweepFx ? null : (
      <g>
        <path d="M60 22 L67 86" stroke="url(#vq-handle)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M63.5 83 H70.5 L73.5 91 Q67 94.6 61 91 Z" fill="#F6B39B" />
        <rect x="62.8" y="81.4" width="8.4" height="2.6" rx="1.3" fill="#E0705A" />
      </g>
    )}

    <rect x="74" y="88" width="20" height="4.6" rx="2" fill="#3E2C22" />
    <rect x="89" y="66" width="5" height="22" rx="2" fill="#8D98A5" />
    <circle cx="91.5" cy="69" r="1.1" fill="#7FB5B0" className="animate-vq-shine" />
    {vacuumFx ? null : (
      <g className="animate-vq-bob" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
        <rect x="76" y="84" width="16" height="6" rx="3" fill="#3E2C22" />
        <rect x="77.5" y="81" width="13" height="4.4" rx="2.2" fill="url(#vq-robot)" />
        <rect x="79" y="82" width="10" height="1.4" rx="0.7" fill="#FFE9D6" opacity="0.85" />
        <circle cx="89.5" cy="82.6" r="0.9" fill="#E0705A" />
      </g>
    )}

    <rect x="84" y="96" width="56" height="20" rx="9" fill="#7FB5B0" />
    <rect x="84" y="96" width="56" height="20" rx="9" fill="none" stroke="#5E9691" strokeWidth="1.4" />
    <rect x="89" y="100.4" width="46" height="11" rx="5" fill="#A8D5D0" opacity="0.8" />
    <rect
      x="109.4"
      y="103.2"
      width="6.2"
      height="6.2"
      rx="1.4"
      fill="#FF8A66"
      transform="rotate(45 112.5 106.3)"
    />

    {laundryFx ? (
      <>
        <rect x="155" y="58" width="8" height="9" rx="3" fill="#FF8A66" className="animate-vq-lift" />
        <rect
          x="170"
          y="70"
          width="9"
          height="3.4"
          rx="1.6"
          fill="#7FB5D6"
          className="animate-vq-bloom"
          style={{ animationDelay: "600ms" }}
        />
        <path
          d="M168 62 H172 V67 L175 69.6 A2.6 2.6 0 1 1 171.4 73 L168 70 Z"
          fill="#E86A8A"
          className="animate-vq-jump"
          style={{ animationDelay: "700ms", transformBox: "fill-box", transformOrigin: "center" }}
        />
        <StarPath x={160} y={52} s={2.4} delay={300} />
      </>
    ) : null}
    <circle cx="158" cy="70.6" r="3" fill="#FF8A66" />
    <circle cx="166" cy="69.8" r="2.6" fill="#7FB5D6" />
    <path d="M152 74 Q150 90 154 91 L172 91 Q176 90 174 74 Z" fill="#C9A876" />
    <rect x="151" y="71.6" width="24" height="4" rx="2" fill="#D8B98C" />
    <g stroke="#B08A5A" strokeWidth="1" strokeLinecap="round" opacity="0.8">
      <path d="M154 80 H172" />
      <path d="M154.6 84.5 H171.4" />
    </g>

    <ellipse cx="196" cy="93" rx="14" ry="4.6" fill="#E8938C" />
    <ellipse cx="196" cy="92" rx="11" ry="3.4" fill="#F6C9C4" />

    <rect x="216" y="80" width="32" height="11.6" rx="3" fill="#7C8794" />
    <rect x="216" y="80" width="32" height="3.2" rx="1.6" fill="#8D98A5" />
    <path d="M219.5 83.4 Q232 81.4 244.5 83.4 L244.5 89.6 Q232 91.6 219.5 89.6 Z" fill="#D9B98C" />
    {litterFx ? (
      <>
        {[-14, 10, -5, 16, 3, -18].map((drift, index) => (
          <circle
            key={drift}
            cx={228 + index * 2.4}
            cy={80}
            r="1"
            fill="#C9A876"
            className="animate-vq-toss"
            style={
              {
                animationDelay: `${index * 140}ms`,
                "--vq-drift": `${drift}px`,
              } as CSSProperties
            }
          />
        ))}
        <StarPath x={222} y={76} s={1.8} delay={600} />
      </>
    ) : null}

    <g className="animate-vq-sway" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
      <ellipse cx="318.6" cy="66" rx="3" ry="10" fill="#6FA85A" transform="rotate(-20 318.6 66)" />
      <ellipse cx="326.4" cy="64" rx="3" ry="11" fill="#8BC34A" transform="rotate(18 326.4 64)" />
      <ellipse cx="322.5" cy="62" rx="3.2" ry="12" fill="#6FA85A" />
    </g>
    <path d="M316 76 L330 76 L328.2 92 L317.8 92 Z" fill="#C96F2B" />
    <rect x="315" y="73.6" width="16" height="3.4" rx="1.7" fill="#E09A55" />
    {gardenFx ? (
      <path
        d="M323 66 C324.4 68.6 327 70 330 70.6 C327 71.2 324.4 72.6 323 75.2 C321.6 72.6 319 71.2 316 70.6 C319 70 321.6 68.6 323 66 Z"
        fill="#E86A8A"
        className="animate-vq-bloom"
      />
    ) : null}

    <rect x="294" y="10" width="18" height="78" rx="2" fill={TRIM} />
    <rect x="296.5" y="12.5" width="13" height="73" rx="1" fill="#A5D8EC" />
    <rect x="296.5" y="62" width="13" height="23.5" rx="1" fill="#9BC77E" />
    <g stroke="#6FA85A" strokeWidth="0.8" strokeLinecap="round" fill="none">
      <path d="M299 85.5 V79.5" />
      <path d="M302.4 85.5 V78.6" />
      <path d="M305.8 85.5 V80" />
    </g>
    <rect x="295.5" y="46" width="14" height="1.6" fill={TRIM} opacity="0.8" />
    <rect x="305.6" y="50" width="1.8" height="6" rx="0.9" fill="#8FA6AD" />

    <path d="M341 78 L351 78 L349.8 92 L342.2 92 Z" fill="#9AA5B1" />
    <rect x="343.4" y="82" width="2.2" height="8" rx="1.1" fill="#B4BEC8" opacity="0.85" />
    <path d="M346 82 V88.6" stroke="#7C8794" strokeWidth="1.2" strokeLinecap="round" />
    <g className={trashFx ? "animate-vq-lid" : undefined}>
      <rect x="339" y="74.4" width="14" height="3.4" rx="1.7" fill="#9AA5B1" />
      <rect x="342.5" y="72.6" width="7" height="2.2" rx="1.1" fill="#8D8071" />
    </g>
    {trashFx ? (
      <path
        d="M343.5 60 Q346 58.6 348.5 60 L349 62 Q351.4 62.6 351.4 65.6 L351.4 68.6 L340.6 68.6 L340.6 65.6 Q340.6 62.6 343 62 Z"
        fill="#D9D2C4"
        className="animate-vq-drop-in"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
    ) : null}

    {windowsFx ? (
      <>
        <rect
          x="250"
          y="14"
          width="18"
          height="28"
          fill="#FFFFFF"
          opacity="0.5"
          className="animate-vq-squeegee"
          style={{ transformBox: "fill-box", transformOrigin: "center", transform: "skewX(-8deg)" }}
        />
        <g className="animate-vq-glint">
          <StarPath x={252} y={22} s={2.2} />
        </g>
      </>
    ) : null}

    {complete ? (
      <>
        <StarPath x={96} y={100} s={2.6} />
        <StarPath x={124} y={106} s={2} delay={550} />
        <StarPath x={150} y={99} s={2.4} delay={1100} />
      </>
    ) : null}

    {vacuumFx ? (
      <g transform="translate(60 84)">
        <g className="animate-vq-patrol-x">
          <rect x="0" y="3" width="24" height="7" rx="3.5" fill="#3E2C22" />
          <rect x="2.5" y="0" width="19" height="4.6" rx="2.3" fill="url(#vq-robot)" />
          <rect x="4.5" y="1.4" width="15" height="1.6" rx="0.8" fill="#FFE9D6" opacity="0.85" />
          <circle cx="21" cy="2.4" r="1.1" fill="#E0705A" className="animate-vq-shine" />
          <circle cx="-4" cy="6" r="1.4" fill="#A8D5D0" className="animate-vq-twinkle" />
          <circle
            cx="-9"
            cy="4"
            r="1"
            fill="#A8D5D0"
            className="animate-vq-twinkle"
            style={{ animationDelay: "400ms" }}
          />
        </g>
      </g>
    ) : null}
  </g>
);

const RoomShellMemo = memo(RoomShell);
const DoorwayMemo = memo(Doorway);
const OfficeDecorMemo = memo(OfficeDecor);
const KitchenDecorMemo = memo(KitchenDecor);
const LaundryDecorMemo = memo(LaundryDecor);
const PlayDecorMemo = memo(PlayDecor);
const LivingDecorMemo = memo(LivingDecor);

type HouseWorldProps = {
  night: boolean;
  complete?: boolean;
  activeRoom: HouseRoom;
  dishesFx?: boolean;
  vacuumFx?: boolean;
  sweepFx?: boolean;
  litterFx?: boolean;
  laundryFx?: boolean;
  trashFx?: boolean;
  gardenFx?: boolean;
  windowsFx?: boolean;
  taskFx?: boolean;
  habitFx?: boolean;
  budgetFx?: boolean;
  budgetBig?: boolean;
  camLeft: number;
  catX: number;
  moving?: boolean;
  walkMs?: number;
  children?: ReactNode;
  extraFloor?: ReactNode;
};

export const HouseWorld = ({
  night,
  complete = false,
  activeRoom,
  dishesFx = false,
  vacuumFx = false,
  sweepFx = false,
  litterFx = false,
  laundryFx = false,
  trashFx = false,
  gardenFx = false,
  windowsFx = false,
  taskFx = false,
  habitFx = false,
  budgetFx = false,
  budgetBig = false,
  camLeft,
  catX,
  moving = false,
  walkMs = WALK_MS,
  children,
  extraFloor,
}: HouseWorldProps) => (
  <svg
    viewBox="0 0 160 120"
    preserveAspectRatio="xMidYMax slice"
    className="absolute inset-0 h-full w-full"
    aria-hidden
  >
    <defs>
      <linearGradient id="vq-shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.18" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="vq-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#A5764A" />
        <stop offset="0.5" stopColor="#B98A56" />
        <stop offset="1" stopColor="#C79A67" />
      </linearGradient>
      <linearGradient id="vq-ao" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3E2C22" stopOpacity="0.4" />
        <stop offset="1" stopColor="#3E2C22" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="vq-shaft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFF6DC" stopOpacity="0.5" />
        <stop offset="1" stopColor="#FFF6DC" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="vq-robot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FF8A33" />
        <stop offset="1" stopColor="#E06A10" />
      </linearGradient>
      <linearGradient id="vq-can" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#AFC3C9" />
        <stop offset="1" stopColor="#8FA6AD" />
      </linearGradient>
      <linearGradient id="vq-handle" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#E09A55" />
        <stop offset="0.5" stopColor="#C96F2B" />
        <stop offset="1" stopColor="#A85E22" />
      </linearGradient>
      <radialGradient id="vq-sun">
        <stop offset="0" stopColor="#FFD97A" stopOpacity="0.85" />
        <stop offset="1" stopColor="#FFD97A" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="vq-moon">
        <stop offset="0" stopColor="#FFF3C2" stopOpacity="0.7" />
        <stop offset="1" stopColor="#FFF3C2" stopOpacity="0" />
      </radialGradient>
      <filter id="vq-soft" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="1.4" />
      </filter>
    </defs>

    <g
      style={{
        transform: `translateX(${-camLeft}px) scale(${moving ? 0.97 : 1})`,
        transformOrigin: "80px 72px",
        transition: `transform ${walkMs}ms ease-in-out`,
      }}
    >
      <g transform="translate(0 0)">
        <RoomShellMemo room="office" active={activeRoom === "office"} />
        <OfficeDecorMemo taskFx={taskFx} night={night} />
      </g>
      <g transform="translate(360 0)">
        <RoomShellMemo room="kitchen" active={activeRoom === "kitchen"} />
        <KitchenDecorMemo budgetFx={budgetFx} budgetBig={budgetBig} />
      </g>
      <g transform="translate(720 0)">
        <RoomShellMemo room="laundry" active={activeRoom === "laundry"} />
        <LaundryDecorMemo habitFx={habitFx} />
      </g>
      <g transform="translate(1080 0)">
        <RoomShellMemo room="living" active={activeRoom === "living"} />
        <LivingDecorMemo
          night={night}
          complete={complete}
          dishesFx={dishesFx}
          vacuumFx={vacuumFx}
          sweepFx={sweepFx}
          litterFx={litterFx}
          laundryFx={laundryFx}
          trashFx={trashFx}
          gardenFx={gardenFx}
          windowsFx={windowsFx}
        />
      </g>
      <g transform="translate(1440 0)">
        <RoomShellMemo room="play" active={activeRoom === "play"} />
        <PlayDecorMemo />
      </g>
      {[360, 720, 1080, 1440].map((x) => (
        <DoorwayMemo key={x} x={x} />
      ))}
      <g
        style={{
          transform: `translateX(${catX - 32}px)`,
          transition: `transform ${walkMs}ms ease-in-out`,
        }}
      >
        <ellipse cx="32" cy="94" rx="15" ry="2.8" fill="#3E2C22" opacity="0.22" filter="url(#vq-soft)" />
        {children}
      </g>
      {extraFloor}
    </g>
  </svg>
);

type CatSceneProps = {
  progress: number;
  complete: boolean;
  celebrating: boolean;
  activity: Activity;
  activityKey: number;
  particles: SceneParticle[];
};

export function CatScene({
  progress,
  complete,
  celebrating,
  activity,
  activityKey,
  particles,
}: CatSceneProps) {
  const night = useIsNight();
  const active = activity !== "idle";

  const [mouse, setMouse] = useState(false);
  const [spin, setSpin] = useState(false);
  const lastKey = useRef(activityKey);
  const mouseTimer = useRef<number | undefined>(undefined);
  const traveled = useRef(false);
  const { catX, moving, walkDir, walkMs, walkTo, xRef } = useKottonWalk({
    room: "living",
    getInitialX: () => readKottonPos().x,
  });

  useEffect(() => {
    if (traveled.current) return;
    traveled.current = true;
    const pos = readKottonPos();
    if (pos.room !== "living") {
      const target = TARGET_X[activity] + LIVING;
      walkTo(target, travelMs(xRef.current, target));
    }
  }, [activity, walkTo, xRef]);

  useEffect(
    () => () => {
      if (mouseTimer.current !== undefined) window.clearTimeout(mouseTimer.current);
    },
    []
  );

  useEffect(() => {
    if (!celebrating) return;
    walkTo(1240);
    const start = window.setTimeout(() => setSpin(true), 950);
    const stop = window.setTimeout(() => setSpin(false), 1750);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(stop);
      setSpin(false);
    };
  }, [celebrating, walkTo]);

  useEffect(() => {
    if (lastKey.current === activityKey) return;
    lastKey.current = activityKey;
    setMouse(false);
    if (mouseTimer.current !== undefined) {
      window.clearTimeout(mouseTimer.current);
      mouseTimer.current = undefined;
    }
    walkTo(TARGET_X[activity] + LIVING);
  }, [activityKey, activity, walkTo]);

  useEffect(() => {
    if (activity !== "idle") return;
    const interval = window.setInterval(() => {
      const chase = Math.random() < 0.4;
      if (chase) setMouse(true);
      walkTo(pickSpot(chase ? MOUSE_SPOTS : IDLE_SPOTS, xRef.current));
      if (chase) {
        if (mouseTimer.current !== undefined) window.clearTimeout(mouseTimer.current);
        mouseTimer.current = window.setTimeout(() => {
          mouseTimer.current = undefined;
          setMouse(false);
        }, walkMs + 1600);
      }
    }, 5000);
    return () => window.clearInterval(interval);
  }, [activity, walkMs, walkTo, xRef]);

  const acting = active && !moving;
  const dirt = complete ? 0 : 1 - progress;

  const catPose = moving
    ? "animate-vq-walk"
    : spin
      ? "animate-vq-spin"
      : mouse
        ? "animate-vq-pounce"
        : !active
          ? undefined
          : activity === "sweep"
            ? "animate-vq-lean"
            : activity === "dishes" ||
                activity === "litter" ||
                activity === "laundry" ||
                activity === "garden" ||
                activity === "vacuum"
              ? "animate-vq-crouch"
              : activity === "windows" || activity === "dust"
                ? "animate-vq-reach"
                : "animate-vq-carry";

  const facing: CatFacing = moving
    ? walkDir
    : mouse
      ? walkDir
      : !active
        ? "front"
        : activity === "dishes"
          ? "left"
          : activity === "litter"
            ? "back"
            : activity === "laundry" || activity === "garden" || activity === "vacuum"
              ? "front"
              : "right";

  const catAction: CatAction = acting ? activity : "none";
  const camLeft = Math.max(0, Math.min(CAM_MAX, catX - 80));

  return (
    <div
      className={`relative h-[38vh] max-h-[420px] min-h-[280px] overflow-hidden rounded-t-2xl border-2 border-b-0 border-accent bg-[#EAD8B4] ${
        celebrating ? "animate-vq-shake" : ""
      }`}
    >
      <HouseWorld
        night={night}
        complete={complete}
        activeRoom="living"
        dishesFx={activity === "dishes" && acting}
        vacuumFx={activity === "vacuum" && acting}
        sweepFx={activity === "sweep" && acting}
        litterFx={activity === "litter" && acting}
        laundryFx={activity === "laundry" && acting}
        trashFx={activity === "trash" && acting}
        gardenFx={activity === "garden" && acting}
        windowsFx={activity === "windows" && acting}
        camLeft={camLeft}
        catX={catX}
        moving={moving && !celebrating}
        walkMs={walkMs}
      >
        <g transform="translate(0 42)">
          <g key={facing} className="animate-vq-turn">
            <g className={catPose}>
              <Kotton
                happy={complete || celebrating || spin}
                excited={acting || celebrating || mouse}
                action={catAction}
                facing={facing}
              />
              {acting && activity === "sweep" ? (
                <g className="animate-vq-tool-sweep">
                  <path d="M47 12 L51.5 42" stroke="url(#vq-handle)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
                  <path d="M47.8 40.4 H56 L58.8 48.6 Q52.4 52.4 46.4 48.6 Z" fill="#F6B39B" />
                  <rect x="47" y="38.6" width="9.6" height="2.6" rx="1.3" fill="#E0705A" />
                  {[-14, -5, 4, 13, 20].map((drift, index) => (
                    <circle
                      key={drift}
                      cx={44 + index * 3}
                      cy={49}
                      r="1.1"
                      fill="#C9B896"
                      className="animate-vq-toss"
                      style={
                        {
                          animationDelay: `${index * 180}ms`,
                          "--vq-drift": `${drift}px`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </g>
              ) : null}
              {acting && activity === "dust" ? (
                <g className="animate-vq-tool-dust">
                  <rect x="46.4" y="0" width="2.4" height="24" rx="1.2" fill="#C96F2B" />
                  <path d="M47.6 4 C43 5 41 8.6 42 12.6 C44.6 10.2 46.2 9.4 47.6 8.8 Z" fill="#F6B39B" />
                  <path d="M47.6 4 C52.2 5 54.2 8.6 53.2 12.6 C50.6 10.2 49 9.4 47.6 8.8 Z" fill="#F0954F" />
                  <ellipse cx="47.6" cy="9.4" rx="4.2" ry="6" fill="#F6B39B" />
                  <rect x="45.4" y="0.6" width="4.4" height="3" rx="1.5" fill="#E0705A" />
                  {[0, 400].map((delay, index) => (
                    <circle
                      key={delay}
                      cx={52 + index * 5}
                      cy={12 - index * 4}
                      r="1.6"
                      fill="#D8CFBB"
                      opacity="0.8"
                      className="animate-vq-twinkle"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </g>
              ) : null}
              {acting && activity === "litter" ? (
                <g className="animate-vq-dig">
                  <path d="M46 20 V29" stroke="#C96F2B" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M42.5 29 H49.5 Q50.2 34.6 46 36.6 Q41.8 34.6 42.5 29 Z" fill="#9AA5B1" />
                  <path d="M43.6 30.4 Q46 29.2 48.4 30.4 Q48.4 33 46 34.2 Q43.6 33 43.6 30.4 Z" fill="#D9B98C" />
                </g>
              ) : null}
              {acting && activity === "trash" ? (
                <g>
                  <path
                    d="M44 16 Q46.6 14.6 49.2 16 L49.8 18 Q52.4 18.6 52.4 21.6 L52.4 26 Q52.4 28.4 50 28.4 L43.6 28.4 Q41.2 28.4 41.2 26 L41.2 21.6 Q41.2 18.6 43.4 18 Z"
                    fill="#D9D2C4"
                    className="animate-vq-bob"
                  />
                  <path d="M44 16 Q46.6 18 49.2 16" fill="none" stroke="#B4AC9C" strokeWidth="1.2" strokeLinecap="round" />
                </g>
              ) : null}
              {acting && activity === "garden" ? (
                <>
                  <g className="animate-vq-pour">
                    <path d="M42 14 H52.5 Q53.6 22 50.6 24.6 H43.8 Q40.4 22 42 14 Z" fill="url(#vq-can)" />
                    <rect x="41.4" y="12.4" width="12.4" height="2.6" rx="1.3" fill="#AFC3C9" />
                    <path d="M52.8 16.6 L59 12.6" stroke="#8FA6AD" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M42.4 15.4 Q38.4 16.4 39.4 20.4" stroke="#8FA6AD" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  </g>
                  {[0, 350, 700].map((delay, index) => (
                    <circle
                      key={delay}
                      cx={55 + index * 2.4}
                      cy={14}
                      r="1.1"
                      fill="#7FB5D6"
                      className="animate-vq-drip"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </>
              ) : null}
              {acting && activity === "tidy" ? (
                <g>
                  <g className="animate-vq-push">
                    <rect x="44" y="37" width="13" height="11.4" rx="2" fill="#C9A876" />
                    <rect x="44" y="37" width="13" height="3" rx="1.5" fill="#B08A5A" />
                    <rect x="49.6" y="37.4" width="2" height="10.6" fill="#B08A5A" opacity="0.9" />
                  </g>
                </g>
              ) : null}
              {mouse ? <ToyMouse flip={walkDir === "left"} /> : null}
            </g>
          </g>
        </g>
      </HouseWorld>

      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{ opacity: dirt }}
        aria-hidden
      >
        {DUST_MOTES.map((mote, index) => (
          <span
            key={index}
            className="animate-vq-particle absolute rounded-full bg-[#C9B896]"
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

      {!night && !acting && !complete ? (
        <div className="animate-vq-fly absolute bottom-[34%] left-0" key="butterfly" aria-hidden>
          <Butterfly />
        </div>
      ) : null}

      {night && !acting && !complete
        ? [
            { left: "70%", bottom: "40%", delay: "0s" },
            { left: "80%", bottom: "30%", delay: "1.1s" },
            { left: "62%", bottom: "26%", delay: "2.2s" },
          ].map((firefly, index) => (
            <span
              key={index}
              className="animate-vq-glow absolute size-1.5 rounded-full bg-[#F2EBA2] shadow-[0_0_6px_2px_rgba(242,235,162,0.6)]"
              style={{ left: firefly.left, bottom: firefly.bottom, animationDelay: firefly.delay }}
              aria-hidden
            />
          ))
        : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-[30%] flex justify-center">
        {particles.map((particle) =>
          particle.kind === "star" ? (
            <svg key={particle.id} viewBox="0 0 12 12" className="animate-vq-particle absolute h-3.5 w-3.5" style={{ "--vq-drift": `${particle.drift}px`, animationDelay: `${particle.delay}ms` } as CSSProperties} aria-hidden>
              <path
                d="M6 0 C6.6 3.4 8.6 5.4 12 6 C8.6 6.6 6.6 8.6 6 12 C5.4 8.6 3.4 6.6 0 6 C3.4 5.4 5.4 3.4 6 0 Z"
                fill={particle.color}
              />
            </svg>
          ) : (
            <span
              key={particle.id}
              className={`animate-vq-particle absolute ${
                particle.kind === "bub" ? "size-2.5 rounded-full" : "size-2 rounded-[4px]"
              }`}
              style={
                {
                  backgroundColor: particle.color,
                  boxShadow:
                    particle.kind === "bub"
                      ? "inset -1px -1px 2px rgba(255,255,255,0.65)"
                      : undefined,
                  "--vq-drift": `${particle.drift}px`,
                  animationDelay: `${particle.delay}ms`,
                } as CSSProperties
              }
              aria-hidden
            />
          )
        )}
      </div>

      {active || mouse ? (
        <div className="animate-vq-float absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-[#221D17]/90 px-3 py-1 text-[11px] font-semibold text-[#FFF9F2] shadow-md">
          {moving
            ? mouse
              ? "Kotton chasse la souris !"
              : "Kotton y va…"
            : mouse
              ? "Attrapée ! Kotton est fier ✨"
              : ACTIVITY_CAPTIONS[activity]}
        </div>
      ) : null}

      {celebrating ? (
        <>
          <div
            className="animate-vq-burst absolute bottom-[20%] left-1/2 size-32 rounded-full border-4 border-accent/60"
            aria-hidden
          />
          <div
            className="animate-vq-burst absolute bottom-[20%] left-1/2 size-32 rounded-full border-2 border-[#E86A8A]/50"
            style={{ animationDelay: "300ms" }}
            aria-hidden
          />
          {CELEBRATION.map((particle, index) =>
            particle.kind === "star" ? (
              <svg key={index} viewBox="0 0 12 12" className="animate-vq-celebrate absolute top-0 h-4 w-4" style={{ left: `${particle.left}%`, animationDelay: `${particle.delay}ms` }} aria-hidden>
                <path
                  d="M6 0 C6.6 3.4 8.6 5.4 12 6 C8.6 6.6 6.6 8.6 6 12 C5.4 8.6 3.4 6.6 0 6 C3.4 5.4 5.4 3.4 6 0 Z"
                  fill={particle.color}
                />
              </svg>
            ) : (
              <span
                key={index}
                className="animate-vq-celebrate absolute top-0 size-2.5 rounded-[40%]"
                style={{
                  left: `${particle.left}%`,
                  animationDelay: `${particle.delay}ms`,
                  backgroundColor: particle.color,
                }}
                aria-hidden
              />
            )
          )}
          <div className="animate-vq-float absolute inset-x-8 top-1/2 -translate-y-1/2 rounded-xl bg-accent px-4 py-2 text-center text-sm font-bold text-white shadow-lg">
            🏆 Mission accomplie ! Kotton est fier de vous ✨
          </div>
        </>
      ) : null}
    </div>
  );
}

const ROOM_REACTION_X: Record<"office" | "kitchen" | "laundry", number> = {
  office: 218,
  kitchen: 648,
  laundry: 950,
};

const ROOM_SPOTS: Record<"office" | "kitchen" | "laundry", number[]> = {
  office: [96, 150, 210, 262, 310],
  kitchen: [436, 486, 560, 612, 664],
  laundry: [796, 856, 940, 1004, 1046],
};

const REACTION_CAPTIONS: Record<"task" | "habit" | "budget", string> = {
  task: "Kotton note la tâche !",
  habit: "Un sticker de plus sur le calendrier !",
  budget: "Kotton met une pièce de côté !",
};

type RoomSceneProps = {
  room: "office" | "kitchen" | "laundry";
  houseEvent: HouseEvent;
};

export function RoomScene({ room, houseEvent }: RoomSceneProps) {
  const night = useIsNight();
  const offset = ROOM_OFFSET[room];

  const [fx, setFx] = useState<"task" | "habit" | "budget" | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const fxTimer = useRef<number | undefined>(undefined);
  const fxEndTimer = useRef<number | undefined>(undefined);
  const traveled = useRef(false);
  const lastEvent = useRef<number | null>(null);
  const { catX, moving, walkDir, walkMs, walkTo, xRef } = useKottonWalk({
    room,
    getInitialX: () => {
      const pos = readKottonPos();
      return pos.room === room ? pos.x : offset + 210;
    },
  });

  useEffect(() => {
    if (traveled.current) return;
    traveled.current = true;
    const pos = readKottonPos();
    if (pos.room !== room) {
      const target = offset + 210;
      const ms = travelMs(xRef.current, target);
      setCaption("Kotton traverse la maison…");
      walkTo(target, ms);
      const arrival = window.setTimeout(() => {
        setCaption((current) =>
          current === "Kotton traverse la maison…" ? null : current
        );
      }, ms + 60);
      return () => window.clearTimeout(arrival);
    }
  }, [room, offset, walkTo, xRef]);

  useEffect(
    () => () => {
      if (fxTimer.current !== undefined) window.clearTimeout(fxTimer.current);
      if (fxEndTimer.current !== undefined) window.clearTimeout(fxEndTimer.current);
    },
    []
  );

  useEffect(() => {
    if (houseEvent.kind === "none") return;
    if (lastEvent.current === null) {
      lastEvent.current = houseEvent.ts;
      return;
    }
    if (lastEvent.current === houseEvent.ts) return;
    lastEvent.current = houseEvent.ts;
    if (Date.now() - houseEvent.ts > 20000) return;
    const kind = houseEvent.kind;
    const target = ROOM_REACTION_X[room];
    const ms = travelMs(xRef.current, target);
    setCaption(
      kind === "budget" && houseEvent.big
        ? "Oups, grosse dépense… Kotton fait la grimace"
        : REACTION_CAPTIONS[kind]
    );
    walkTo(target, ms);
    if (fxTimer.current !== undefined) window.clearTimeout(fxTimer.current);
    if (fxEndTimer.current !== undefined) window.clearTimeout(fxEndTimer.current);
    fxTimer.current = window.setTimeout(() => setFx(kind), ms + 80);
    fxEndTimer.current = window.setTimeout(() => {
      fxEndTimer.current = undefined;
      setFx(null);
      setCaption(null);
    }, ms + 2900);
  }, [houseEvent, room, walkTo, xRef]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (fx !== null || caption !== null) return;
      walkTo(pickSpot(ROOM_SPOTS[room], xRef.current));
    }, 6500);
    return () => window.clearInterval(interval);
  }, [room, fx, caption, walkTo, xRef]);

  const camLeft = Math.max(0, Math.min(CAM_MAX, catX - 80));

  const catPose = moving
    ? "animate-vq-walk"
    : fx === "budget"
      ? "animate-vq-carry"
      : fx
        ? "animate-vq-reach"
        : undefined;
  const facing: CatFacing = moving
    ? walkDir
    : room === "laundry" && fx
      ? "left"
      : "right";

  return (
    <div className="relative h-[38vh] max-h-[420px] min-h-[280px] overflow-hidden rounded-t-2xl border-2 border-b-0 border-accent bg-[#EAD8B4]">
      <HouseWorld
        night={night}
        activeRoom={room}
        taskFx={fx === "task"}
        habitFx={fx === "habit"}
        budgetFx={fx === "budget"}
        camLeft={camLeft}
        catX={catX}
        moving={moving}
        walkMs={walkMs}
      >
        <g transform="translate(0 42)">
          <g key={facing} className="animate-vq-turn">
            <g className={catPose}>
              <Kotton
                excited={Boolean(fx) || moving}
                action={fx === "budget" ? "trash" : fx ? "dust" : "none"}
                facing={facing}
              />
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

      <div className="pointer-events-none absolute inset-x-0 bottom-[30%] flex justify-center">
        {fx
          ? [0, 260, 520].map((delay, index) => (
              <svg
                key={delay}
                viewBox="0 0 12 12"
                className="animate-vq-particle absolute h-3 w-3"
                style={
                  {
                    left: `${34 + index * 16}%`,
                    "--vq-drift": `${index % 2 === 0 ? 10 : -10}px`,
                    animationDelay: `${delay}ms`,
                  } as CSSProperties
                }
                aria-hidden
              >
                <path
                  d="M6 0 C6.6 3.4 8.6 5.4 12 6 C8.6 6.6 6.6 8.6 6 12 C5.4 8.6 3.4 6.6 0 6 C3.4 5.4 5.4 3.4 6 0 Z"
                  fill="#FFD97A"
                />
              </svg>
            ))
          : null}
      </div>

      {caption ? (
        <div className="pointer-events-none absolute inset-x-6 top-3 flex justify-center">
          <span className="animate-vq-float rounded-full bg-[#221D17]/90 px-3 py-1 text-center text-[11px] font-semibold text-[#FFF9F2] shadow-md">
            {caption}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export const HouseBanner = ({ children }: { children?: ReactNode }) => {
  const [history] = useStoredState<ChoreHistoryEntry[]>(
    STORAGE_KEYS.choresHistory,
    []
  );
  const xp = computeXp(history);
  const { level, into, needed } = levelFromXp(xp);

  return (
    <div className="rounded-b-2xl border-2 border-t-0 border-accent bg-surface/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          Niveau {level} · {rankTitle(level)}
        </p>
        <p className="text-sm font-bold text-accent-ink">{xp} XP</p>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-raised">
        <div
          className="animate-vq-shimmer h-full rounded-full"
          style={{ width: `${needed === 0 ? 0 : Math.round((into / needed) * 100)}%` }}
        />
      </div>
      {children}
    </div>
  );
};

const Butterfly = () => (
  <svg viewBox="0 0 12 10" className="h-3.5 w-4" aria-hidden>
    <g className="animate-vq-flap">
      <ellipse cx="3" cy="3.4" rx="3" ry="2.4" fill="#7FB5D6" />
      <ellipse cx="3.4" cy="6.8" rx="2.2" ry="1.6" fill="#5E96C4" />
      <ellipse cx="9" cy="3.4" rx="3" ry="2.4" fill="#7FB5D6" />
      <ellipse cx="8.6" cy="6.8" rx="2.2" ry="1.6" fill="#5E96C4" />
    </g>
    <rect x="5.2" y="1.6" width="1.6" height="7" rx="0.8" fill="#3E2C22" />
  </svg>
);
