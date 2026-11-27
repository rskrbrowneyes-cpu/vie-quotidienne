import type { CSSProperties } from "react";

import { KottonCat } from "./cat";

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

const FLOOR_SPARKLES = [
  { left: 26, delay: 0 },
  { left: 56, delay: 550 },
  { left: 80, delay: 1100 },
];

const WOOD = "#B98A56";
const WOOD_DARK = "#9A6B3F";
const WOOD_LIGHT = "#A87947";
const TRIM = "#8B5E34";

const Sparkle = ({
  color,
  className = "",
  style,
}: {
  color: string;
  className?: string;
  style?: CSSProperties;
}) => (
  <svg viewBox="0 0 12 12" className={className} style={style} aria-hidden>
    <path
      d="M6 0 C6.6 3.4 8.6 5.4 12 6 C8.6 6.6 6.6 8.6 6 12 C5.4 8.6 3.4 6.6 0 6 C3.4 5.4 5.4 3.4 6 0 Z"
      fill={color}
    />
  </svg>
);

const Drop = ({ className = "", style }: { className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 8 11" className={className} style={style} aria-hidden>
    <path
      d="M4 0.6 C5.2 3 7.4 4.6 7.4 7 A3.4 3.4 0 1 1 0.6 7 C0.6 4.6 2.8 3 4 0.6 Z"
      fill="#7FB5D6"
    />
  </svg>
);

const Paw = ({ className = "", style }: { className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 10 8" className={className} style={style} aria-hidden>
    <ellipse cx="5" cy="5" rx="4" ry="3" fill="#F0954F" />
    <ellipse cx="5" cy="4.1" rx="4" ry="2.1" fill="#FFB877" opacity="0.75" />
  </svg>
);

const Broom = () => (
  <svg viewBox="0 0 18 44" className="h-24 w-10" aria-hidden>
    <defs>
      <linearGradient id="vq-broom-handle" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#E09A55" />
        <stop offset="0.5" stopColor="#C96F2B" />
        <stop offset="1" stopColor="#A85E22" />
      </linearGradient>
    </defs>
    <rect x="7" y="1" width="4" height="27" rx="2" fill="url(#vq-broom-handle)" />
    <path d="M4.5 26 H13.5 L15.8 37.5 Q9 41.8 2.2 37.5 Z" fill="#F6B39B" />
    <rect x="3.8" y="25.4" width="10.4" height="3.2" rx="1.6" fill="#E0705A" />
    <g stroke="#E8A98F" strokeWidth="1" strokeLinecap="round">
      <path d="M5.5 30.5 L4.2 38" />
      <path d="M9 30.5 V39.4" />
      <path d="M12.5 30.5 L13.8 38" />
    </g>
  </svg>
);

const Duster = () => (
  <svg viewBox="0 0 16 44" className="h-24 w-9" aria-hidden>
    <rect x="6.8" y="14" width="2.4" height="30" rx="1.2" fill="#C96F2B" />
    <path d="M8 3 C3.5 4 1.6 7.5 2.6 11.5 C5 9.2 6.6 8.4 8 7.8 Z" fill="#F6B39B" />
    <path d="M8 3 C12.5 4 14.4 7.5 13.4 11.5 C11 9.2 9.4 8.4 8 7.8 Z" fill="#F0954F" />
    <ellipse cx="8" cy="8.4" rx="4.2" ry="6" fill="#F6B39B" />
    <rect x="6" y="0.6" width="4" height="3" rx="1.5" fill="#E0705A" />
    <rect x="5" y="12.4" width="6" height="2.4" rx="1.2" fill="#E0705A" />
  </svg>
);

const Vacuum = () => (
  <svg viewBox="0 0 26 12" className="animate-vq-vacuum h-7 w-[72px]" aria-hidden>
    <defs>
      <linearGradient id="vq-robot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FF8A33" />
        <stop offset="1" stopColor="#E06A10" />
      </linearGradient>
    </defs>
    <rect x="1" y="4" width="24" height="7.4" rx="3.7" fill="#3E2C22" />
    <rect x="3.5" y="0.8" width="19" height="5" rx="2.5" fill="url(#vq-robot)" />
    <rect x="5.5" y="2" width="15" height="1.7" rx="0.85" fill="#FFE9D6" opacity="0.85" />
    <circle cx="21" cy="3.3" r="1.1" fill="#E0705A" className="animate-vq-shine" />
    <rect x="0.2" y="6" width="2.4" height="4.2" rx="1.2" fill="#2A1D15" />
    <rect x="23.4" y="6" width="2.4" height="4.2" rx="1.2" fill="#2A1D15" />
  </svg>
);

const LitterBox = () => (
  <svg viewBox="0 0 40 20" className="h-14 w-28" aria-hidden>
    <rect x="2" y="6" width="36" height="12" rx="3.5" fill="#7C8794" />
    <rect x="2" y="6" width="36" height="3.4" rx="1.7" fill="#8D98A5" />
    <rect x="4.5" y="8.6" width="31" height="9.4" rx="3" fill="#F5F2EA" />
    <path
      d="M6.5 11.2 Q20 8.8 33.5 11.2 L33.5 15 Q20 17.6 6.5 15 Z"
      fill="#D9B98C"
    />
    <ellipse cx="13" cy="11.2" rx="2.6" ry="1.1" fill="#C9A876" />
    <circle cx="26" cy="11.6" r="1.1" fill="#B98A56" />
  </svg>
);

const Basket = () => (
  <svg viewBox="0 0 26 18" className="h-12 w-16" aria-hidden>
    <circle cx="9" cy="3.6" r="2.5" fill="#FF8A33" />
    <circle cx="15.5" cy="3.2" r="2.3" fill="#7FB5D6" />
    <path d="M3 6.4 Q2 16 4.6 16.6 L21.4 16.6 Q24 16 23 6.4 Z" fill="#C9A876" />
    <rect x="2" y="4.2" width="22" height="3.4" rx="1.7" fill="#D8B98C" />
    <g stroke="#B08A5A" strokeWidth="1" strokeLinecap="round" opacity="0.8">
      <path d="M5 10 H21" />
      <path d="M5.4 13 H20.6" />
    </g>
  </svg>
);

const Bin = () => (
  <svg viewBox="0 0 18 24" className="h-14 w-11" aria-hidden>
    <g className="animate-vq-lid">
      <rect x="2" y="1.6" width="14" height="3" rx="1.5" fill="#9AA5B1" />
      <rect x="4.5" y="0" width="9" height="2.4" rx="1.2" fill="#8D8071" />
    </g>
    <path d="M3.5 5.4 Q3 20 5.2 22.4 L12.8 22.4 Q15 20 14.5 5.4 Z" fill="#9AA5B1" />
    <rect x="4.4" y="6" width="2.4" height="15.4" rx="1.2" fill="#B4BEC8" opacity="0.85" />
    <g stroke="#7C8794" strokeWidth="1.4" strokeLinecap="round">
      <path d="M7.2 9 V18" />
      <path d="M11 9 V18" />
    </g>
  </svg>
);

const Zzz = ({ className = "", style }: { className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 8 8" className={className} style={style} aria-hidden>
    <path
      d="M1.5 1.5 H6.5 L1.5 6.5 H6.5"
      fill="none"
      stroke="#8D8071"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Scoop = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 12 16" className={className} aria-hidden>
    <path d="M6 1 V8" stroke="#C96F2B" strokeWidth="2" strokeLinecap="round" />
    <path d="M2.5 8 H9.5 Q10 13 6 14.6 Q2 13 2.5 8 Z" fill="#9AA5B1" />
    <path d="M3.4 9.2 Q6 8.2 8.6 9.2 Q8.6 11.6 6 12.7 Q3.4 11.6 3.4 9.2 Z" fill="#D9B98C" />
  </svg>
);

const Can = () => (
  <svg viewBox="0 0 20 18" className="h-10 w-12" aria-hidden>
    <defs>
      <linearGradient id="vq-can" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#AFC3C9" />
        <stop offset="1" stopColor="#8FA6AD" />
      </linearGradient>
    </defs>
    <path d="M4 6.4 H15 Q15.8 14 13 16.6 H6.6 Q3.6 14 4 6.4 Z" fill="url(#vq-can)" />
    <rect x="3.4" y="4.8" width="12.2" height="2.6" rx="1.3" fill="#AFC3C9" />
    <path d="M15.4 7 L19 4" stroke="#8FA6AD" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="18.7" cy="3.8" r="1.2" fill="#7FB5D6" />
    <path d="M4.4 5.8 Q0.4 6.8 1.4 10.8" stroke="#8FA6AD" strokeWidth="1.8" fill="none" strokeLinecap="round" />
  </svg>
);

const Flower = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 12 16" className={className} aria-hidden>
    <path d="M6 7 V15" stroke="#6FA85A" strokeWidth="1.6" strokeLinecap="round" />
    <ellipse cx="3.4" cy="11" rx="2.2" ry="1.2" fill="#6FA85A" transform="rotate(-25 3.4 11)" />
    <ellipse cx="8.6" cy="9.5" rx="2.2" ry="1.2" fill="#8BC34A" transform="rotate(25 8.6 9.5)" />
    <g fill="#E86A8A">
      <circle cx="6" cy="1.7" r="2.2" />
      <circle cx="8.4" cy="3.5" r="2.2" />
      <circle cx="7.5" cy="6.2" r="2.2" />
      <circle cx="4.5" cy="6.2" r="2.2" />
      <circle cx="3.6" cy="3.5" r="2.2" />
    </g>
    <circle cx="6" cy="4" r="1.6" fill="#FFD97A" />
  </svg>
);

const Bag = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 12 14" className={className} aria-hidden>
    <path
      d="M4 1.6 Q6 0.6 8 1.6 L8.4 3.2 Q10.5 3.7 10.5 6.6 L10.5 11 Q10.5 13 8.5 13 L3.5 13 Q1.5 13 1.5 11 L1.5 6.6 Q1.5 3.7 3.6 3.2 Z"
      fill="#D9D2C4"
    />
    <path d="M4 1.6 Q6 3 8 1.6" fill="none" stroke="#B4AC9C" strokeWidth="1.2" strokeLinecap="round" />
    <rect x="1.8" y="6" width="8.4" height="1.6" rx="0.8" fill="#C4BCAC" />
  </svg>
);

const Box = ({ className = "", style }: { className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 14 12" className={className} style={style} aria-hidden>
    <rect x="0.8" y="1" width="12.4" height="10.4" rx="2" fill="#C9A876" />
    <rect x="0.8" y="1" width="12.4" height="2.8" rx="1.4" fill="#B08A5A" />
    <rect x="6" y="1.4" width="2" height="10" fill="#B08A5A" opacity="0.9" />
    <rect x="1.8" y="1.8" width="10.4" height="0.9" rx="0.45" fill="#E0C79A" />
  </svg>
);

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

const RoomView = ({
  night,
  complete,
  dishesActive,
  vacuumActive,
}: {
  night: boolean;
  complete: boolean;
  dishesActive: boolean;
  vacuumActive: boolean;
}) => (
  <svg
    viewBox="0 0 160 120"
    preserveAspectRatio="xMidYMax slice"
    className="animate-vq-parallax absolute inset-0 h-full w-full"
    aria-hidden
  >
    <defs>
      <linearGradient id="vq-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#E9EDDA" />
        <stop offset="1" stopColor="#D2DCC0" />
      </linearGradient>
      <linearGradient id="vq-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#A5764A" />
        <stop offset="0.5" stopColor={WOOD} />
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
      <linearGradient id="vq-pole" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#E09A55" />
        <stop offset="0.5" stopColor="#C96F2B" />
        <stop offset="1" stopColor="#A85E22" />
      </linearGradient>
      <linearGradient id="vq-robot-parked" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FF8A33" />
        <stop offset="1" stopColor="#E06A10" />
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
    <rect x="0" y="0" width="160" height="92" fill="url(#vq-wall)" />
    <rect x="0" y="70" width="160" height="18" fill="#C4D2B4" />
    <rect x="0" y="70" width="160" height="1.2" fill="#B0C2A0" />
    <rect x="0" y="88" width="160" height="4" fill="#D9B98C" />
    <rect x="0" y="92" width="160" height="28" fill="url(#vq-floor)" />
    {[99, 106, 113, 120, 127, 134, 141, 148].map((y) => (
      <rect key={y} x="0" y={y} width="160" height="0.8" fill={WOOD_DARK} opacity="0.45" />
    ))}
    <rect x="24" y="93" width="1" height="5" fill={WOOD_DARK} opacity="0.5" />
    <rect x="72" y="100" width="1" height="5" fill={WOOD_DARK} opacity="0.5" />
    <rect x="120" y="93" width="1" height="5" fill={WOOD_DARK} opacity="0.5" />
    <rect x="48" y="114" width="1" height="5" fill={WOOD_DARK} opacity="0.5" />
    <rect x="0" y="92" width="160" height="5" fill="#FFF7E8" opacity="0.08" />

    <rect x="104" y="8" width="42" height="40" rx="4.5" fill={TRIM} />
    <g className={`transition-opacity duration-1000 ${night ? "opacity-100" : "opacity-0"}`}>
      <rect x="107" y="11" width="36" height="34" rx="2.5" fill="#263149" />
      <circle cx="111" cy="15" r="0.9" fill="#FFF" className="animate-vq-shine" />
      <circle cx="130" cy="14" r="0.9" fill="#FFF" className="animate-vq-shine" style={{ animationDelay: "1.1s" }} />
      <circle cx="138" cy="22.5" r="0.9" fill="#FFF" className="animate-vq-shine" style={{ animationDelay: "2.2s" }} />
      <circle cx="120" cy="36.5" r="0.9" fill="#FFF" className="animate-vq-shine" style={{ animationDelay: "0.7s" }} />
      <circle cx="136" cy="20" r="9" fill="url(#vq-moon)" />
      <circle cx="136" cy="20" r="5.2" fill="#FFF3C2" />
      <circle cx="134.2" cy="18.6" r="1.1" fill="#F0E0A8" />
      <circle cx="137.6" cy="21.6" r="0.8" fill="#F0E0A8" />
    </g>
    <g className={`transition-opacity duration-1000 ${night ? "opacity-0" : "opacity-100"}`}>
      <rect x="107" y="11" width="36" height="34" rx="2.5" fill="#A5D8EC" />
      <circle
        cx="118"
        cy="19"
        r="9.5"
        fill="url(#vq-sun)"
        className="animate-vq-glow"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
      <circle cx="118" cy="19" r="4.4" fill="#FFD97A" />
      <circle cx="118" cy="19" r="2.8" fill="#FFE9A8" />
      <g className="animate-vq-drift" style={{ animationDuration: "12s" }} fill="#FFF">
        <circle cx="128" cy="26" r="2.6" />
        <circle cx="132.5" cy="24.6" r="3.2" />
        <circle cx="137" cy="26.4" r="2.4" />
        <rect x="126" y="25.4" width="12.6" height="3.4" rx="1.7" />
      </g>
      <g className="animate-vq-drift" style={{ animationDuration: "16s", animationDelay: "2s" }} fill="#FFF" opacity="0.85">
        <circle cx="130" cy="35" r="2" />
        <circle cx="133.6" cy="34" r="2.5" />
        <circle cx="137" cy="35.2" r="1.8" />
        <rect x="128.4" y="34.4" width="10" height="2.8" rx="1.4" />
      </g>
    </g>
    <rect x="123.5" y="11" width="2" height="34" fill={TRIM} />
    <rect x="107" y="26" width="36" height="2" fill={TRIM} />
    <rect x="102" y="48" width="46" height="3.4" rx="1.7" fill={WOOD_LIGHT} />
    <rect x="102" y="51.4" width="46" height="1.6" fill="#3E2C22" opacity="0.18" />

    {!night ? <polygon points="108,51 146,51 118,120 62,120" fill="url(#vq-shaft)" /> : null}

    <rect x="0" y="92" width="160" height="7" fill="url(#vq-ao)" />

    <rect x="58" y="14" width="18" height="14" rx="2" fill="#8B5E34" />
    <rect x="60" y="16" width="14" height="10" rx="1" fill="#FFF6E4" />
    <path d="M60 26 L64.5 20.5 L68 23.5 L72 18.5 L74 26 Z" fill="#6FA85A" />
    <circle cx="70.5" cy="19" r="1.5" fill="#FF7000" />

    <ellipse cx="20" cy="18.5" rx="10" ry="7" fill="#C9A876" />
    <ellipse cx="20" cy="18.5" rx="8.4" ry="5.6" fill="#D8EEF6" />
    <path
      d="M14.5 17.5 Q16 14.5 19 14"
      stroke="#FFF"
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
      opacity="0.8"
    />

    <rect x="8" y="26" width="30" height="14" rx="2" fill="#8FB8AC" />
    <rect x="8.7" y="26.7" width="8.6" height="6.2" rx="1.3" fill="#A8CFC4" />
    <rect x="18.2" y="26.7" width="8.6" height="6.2" rx="1.3" fill="#A8CFC4" />
    <rect x="27.7" y="26.7" width="8.6" height="6.2" rx="1.3" fill="#A8CFC4" />
    <rect x="8.7" y="33.5" width="8.6" height="6.2" rx="1.3" fill="#A8CFC4" />
    <rect x="18.2" y="33.5" width="8.6" height="6.2" rx="1.3" fill="#A8CFC4" />
    <rect x="27.7" y="33.5" width="8.6" height="6.2" rx="1.3" fill="#A8CFC4" />

    <path
      d="M18 34 V31.5 Q18 29 20.5 29 H23.5"
      stroke="#9AA5B1"
      strokeWidth="2.4"
      fill="none"
      strokeLinecap="round"
    />
    <rect x="22.2" y="29" width="2.6" height="4.4" rx="1.3" fill="#9AA5B1" />
    <circle cx="15.5" cy="31" r="1.6" fill="#FF7000" />
    <rect x="31" y="40.6" width="5" height="2" rx="1" fill="#C9A876" />
    <rect x="31.8" y="38.8" width="3.4" height="2" rx="1" fill="#FF7000" />
    <rect x="10" y="42" width="26" height="2.6" rx="1.3" fill="#F0EBE0" />
    <rect x="11" y="44.4" width="24" height="7" rx="3.2" fill="#FFF" />
    <rect x="12.4" y="45.4" width="21.2" height="4" rx="2" fill="#E8E4DC" />
    <rect x="12" y="51.4" width="22" height="2" rx="1" fill="#D9D2C4" />
    <rect x="14" y="53.4" width="3" height="4" rx="1.5" fill="#C9A876" />
    <rect x="29" y="53.4" width="3" height="4" rx="1.5" fill="#C9A876" />

    {dishesActive ? (
      <g>
        <rect x="15" y="36.4" width="2.2" height="10" rx="1.1" fill="#7FB5D6" className="animate-vq-stream" />
        <circle cx="11.5" cy="40" r="1.6" fill="#FFF" className="animate-vq-rise" />
        <circle cx="26" cy="42" r="1.4" fill="#FFF" className="animate-vq-rise" style={{ animationDelay: "0.5s" }} />
        <circle cx="20" cy="37.5" r="1.2" fill="#FFF" className="animate-vq-rise" style={{ animationDelay: "1s" }} />
        <circle cx="16.5" cy="47.5" r="1.2" fill="#7FB5D6" className="animate-vq-drip" />
        <circle cx="24" cy="47.5" r="1.2" fill="#7FB5D6" className="animate-vq-drip" style={{ animationDelay: "0.45s" }} />
        <g className="animate-vq-scrub">
          <rect x="17" y="45.8" width="8" height="2.2" rx="1.1" fill="#FFF" />
          <rect x="18" y="44.8" width="6" height="1.2" rx="0.6" fill="#F0EBE0" />
        </g>
      </g>
    ) : null}

    <ellipse cx="52" cy="91" rx="10" ry="2.4" fill="#3E2C22" opacity="0.22" filter="url(#vq-soft)" />
    <rect x="44" y="37.6" width="4.4" height="2.2" rx="1.1" fill={TRIM} />
    <rect x="46.7" y="39.4" width="2.6" height="38.6" rx="1.3" fill="url(#vq-pole)" />
    <rect x="42.6" y="77.2" width="12.8" height="2.6" rx="1.3" fill="#E0705A" />
    <path d="M43.4 79.6 H54.6 L56.4 87.5 Q48 91.4 39.6 87.5 Z" fill="#F6B39B" />
    <g stroke="#E8A98F" strokeWidth="1" strokeLinecap="round">
      <path d="M45 80.5 L43.4 88" />
      <path d="M48.6 80.5 V89.2" />
      <path d="M52.2 80.5 L53.8 88" />
    </g>

    <ellipse cx="68" cy="91" rx="12" ry="2.4" fill="#3E2C22" opacity="0.22" filter="url(#vq-soft)" />
    <rect x="58" y="82" width="20" height="8" rx="2.5" fill={TRIM} />
    <rect x="60" y="84" width="16" height="2.2" rx="1.1" fill="#6E4526" />
    {!vacuumActive ? (
      <g>
        <rect x="59" y="76.4" width="18" height="6.2" rx="3.1" fill="url(#vq-robot-parked)" />
        <rect x="61" y="78" width="14" height="1.6" rx="0.8" fill="#FFE9D6" opacity="0.85" />
        <circle cx="74" cy="79.6" r="1.1" fill="#E0705A" className="animate-vq-shine" />
      </g>
    ) : null}

    <ellipse cx="141" cy="91" rx="9" ry="2.2" fill="#3E2C22" opacity="0.22" filter="url(#vq-soft)" />
    <g
      className="animate-vq-sway"
      style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
    >
      <path
        d="M141 77 C139 70 137.5 64 138.5 57"
        stroke="#6FA85A"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="136.5" cy="66" rx="2.6" ry="6" fill="#6FA85A" transform="rotate(-20 136.5 66)" />
      <ellipse cx="145.5" cy="63.5" rx="2.6" ry="6.5" fill="#6FA85A" transform="rotate(20 145.5 63.5)" />
      <ellipse cx="140.5" cy="57.5" rx="2.8" ry="6.5" fill="#8BC34A" />
      <ellipse cx="134.8" cy="71.5" rx="2" ry="4.4" fill="#8BC34A" transform="rotate(-28 134.8 71.5)" />
      <ellipse cx="147.8" cy="70" rx="2" ry="4.8" fill="#6FA85A" transform="rotate(28 147.8 70)" />
    </g>
    <path d="M133 78 H149 L147.4 89.4 Q141 91.2 134.6 89.4 Z" fill="#C96F2B" />
    <rect x="132" y="76" width="18" height="3.6" rx="1.8" fill="#E08A3C" />
    <rect x="134" y="76.6" width="4" height="2.4" rx="1.2" fill="#F5B271" opacity="0.8" />

    <ellipse cx="120" cy="90" rx="13" ry="2.4" fill="#3E2C22" opacity="0.22" filter="url(#vq-soft)" />
    <ellipse cx="120" cy="85" rx="13" ry="5.6" fill="#C9A876" />
    <ellipse cx="120" cy="83.4" rx="10.6" ry="4.2" fill="#B08A5A" />
    <ellipse cx="120" cy="83.8" rx="9.6" ry="3.4" fill="#DCE3C8" />

    <rect x="66" y="98" width="48" height="16" rx="7" fill="#7FB5B0" />
    <rect x="66" y="98" width="48" height="16" rx="7" fill="none" stroke="#5E9691" strokeWidth="1.6" />
    <rect x="70.5" y="102.4" width="39" height="7.2" rx="3.6" fill="#A8D5D0" opacity="0.8" />
    <rect
      x="87.2"
      y="103.3"
      width="5.6"
      height="5.6"
      rx="1.2"
      fill="#FF8A66"
      transform="rotate(45 90 106.1)"
    />

    {complete ? (
      <path
        d="M89.5 92.5 C89.9 94.5 91 95.6 93 96 C91 96.4 89.9 97.5 89.5 99.5 C89.1 97.5 88 96.4 86 96 C88 95.6 89.1 94.5 89.5 92.5 Z"
        fill="#FFD97A"
        className="animate-vq-twinkle"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
    ) : null}
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
  const hour = new Date().getHours();
  const night = hour >= 20 || hour < 7;
  const dirt = complete ? 0 : 1 - progress;
  const active = activity !== "idle";
  const sleeping = night && !active && !complete;
  const catPose = !active
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
  const facing: "left" | "right" | "front" | "back" = !active
    ? "front"
    : activity === "dishes"
      ? "left"
      : activity === "litter"
        ? "back"
        : activity === "laundry" || activity === "garden" || activity === "vacuum"
          ? "front"
          : "right";
  const toolSide = facing === "left" ? "left-1" : "right-1";
  const toolSideOut = facing === "left" ? "-left-3" : "-right-3";

  return (
    <div
      className={`relative h-[38vh] max-h-[420px] min-h-[280px] overflow-hidden rounded-t-2xl border-2 border-b-0 border-accent bg-[#EAD8B4] ${
        celebrating ? "animate-vq-shake" : ""
      }`}
    >
      <RoomView
        night={night}
        complete={complete}
        dishesActive={activity === "dishes"}
        vacuumActive={activity === "vacuum"}
      />

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

      {complete
        ? FLOOR_SPARKLES.map((sparkle, index) => (
            <Sparkle
              key={index}
              color="#FFD97A"
              className="animate-vq-twinkle absolute bottom-[15%] h-4 w-4"
              style={{ left: `${sparkle.left}%`, animationDelay: `${sparkle.delay}ms` }}
            />
          ))
        : null}

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

      <div
        className="absolute bottom-[13%] flex items-end gap-1 transition-[left] duration-700 ease-in-out"
        style={{ left: activity === "windows" ? "58%" : "6%" }}
      >
        <div
          className="absolute bottom-[-4px] left-7 h-3 w-24 rounded-[50%] bg-[#3E2C22]/25 blur-[3px]"
          aria-hidden
        />
        <div className="relative">
          <div key={activityKey} className={catPose}>
            <div key={facing} className="animate-vq-turn">
              <KottonCat
                happy={complete || celebrating}
                sleepy={sleeping}
                excited={active || celebrating}
                action={active ? activity : "none"}
                facing={facing}
                className="size-32 drop-shadow-md"
              />
              {activity === "sweep" ? (
                <div className={`animate-vq-tool-sweep absolute bottom-0 ${toolSide}`}>
                  <Broom />
                  {[-12, -4, 4, 12, 18].map((drift, index) => (
                    <span
                      key={drift}
                      className="animate-vq-particle absolute bottom-1 rounded-full bg-[#C9B896]"
                      style={
                        {
                          left: `${3 + index * 5}px`,
                          width: 3,
                          height: 3,
                          animationDelay: `${index * 180}ms`,
                          "--vq-drift": `${drift}px`,
                        } as CSSProperties
                      }
                      aria-hidden
                    />
                  ))}
                  <div className="absolute -bottom-1 left-2 flex items-end gap-0.5" aria-hidden>
                    <span className="size-1.5 rounded-full bg-[#B8A688]" />
                    <span className="size-1 rounded-full bg-[#C9B896]" />
                    <span className="size-1.5 rounded-full bg-[#B8A688]" />
                  </div>
                </div>
              ) : null}
              {activity === "dust" ? (
                <div className={`animate-vq-tool-dust absolute -top-14 ${toolSideOut}`}>
                  <Duster />
                  {[0, 300, 600].map((delay, index) => (
                    <Sparkle
                      key={delay}
                      color={index === 1 ? "#FFE9D6" : "#FFD9A8"}
                      className="animate-vq-particle absolute h-2.5 w-2.5"
                      style={{
                        left: `${index * 8 - 2}px`,
                        bottom: "2px",
                        animationDelay: `${delay}ms`,
                      }}
                    />
                  ))}
                  {[0, 500].map((delay, index) => (
                    <span
                      key={delay}
                      className="animate-vq-particle absolute bottom-4 size-2.5 rounded-full bg-[#D8CFBB] opacity-80 blur-[1px]"
                      style={{ left: `${6 + index * 14}px`, animationDelay: `${delay}ms` }}
                      aria-hidden
                    />
                  ))}
                </div>
              ) : null}
              {activity === "dishes" ? (
                <Paw className="animate-vq-scrub-paw absolute -top-5 left-7 h-5 w-6" />
              ) : null}
              {activity === "windows" ? (
                <div className="absolute -top-16 right-6 flex items-end gap-1" aria-hidden>
                  <div className="h-6 w-10 -skew-x-12 bg-white/50 blur-[2px] animate-vq-squeegee" />
                  <Paw className="animate-vq-wipe h-5 w-6" />
                </div>
              ) : null}
              {activity === "trash" ? (
                <Bag className="animate-vq-drop-in absolute right-[42px] top-[44px] h-4 w-3.5" />
              ) : null}
              {activity === "tidy" ? (
                <div className="absolute -right-11 bottom-0 h-9 w-10" aria-hidden>
                  <Box className="animate-vq-push h-8 w-9" />
                  <Sparkle
                    color="#FFD97A"
                    className="animate-vq-twinkle absolute -top-3 left-8 h-3.5 w-3.5"
                    style={{ animationDelay: "900ms" }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {sleeping
          ? [0, 700].map((delay, index) => (
              <Zzz
                key={delay}
                className={`animate-vq-rise absolute ${index === 0 ? "-top-9 left-1 h-3 w-3" : "-top-12 left-6 h-2 w-2"}`}
                style={{ animationDelay: `${delay}ms` }}
              />
            ))
          : null}
        {activity === "litter" ? (
          <div className="relative">
            <LitterBox />
            <Scoop className="animate-vq-dig absolute -top-5 right-1 h-7 w-5" />
            <Paw className="animate-vq-scrub-paw absolute top-2 right-8 h-5 w-6" />
            {[-14, 12, -6, 18, 4, -18].map((drift, index) => (
              <span
                key={drift}
                className="animate-vq-toss absolute bottom-7 size-1.5 rounded-full bg-[#D9B98C]"
                style={
                  {
                    left: `${3 + index * 5}px`,
                    animationDelay: `${index * 140}ms`,
                    "--vq-drift": `${drift}px`,
                  } as CSSProperties
                }
                aria-hidden
              />
            ))}
          </div>
        ) : null}
        {activity === "laundry" ? (
          <div className="relative">
            <Basket />
            <Paw className="animate-vq-scrub-paw absolute top-1 left-2 h-5 w-6" />
            <span
              className="animate-vq-tumble absolute -top-7 left-1 h-4 w-4 rounded-[40%] bg-[#FF8A33]"
              aria-hidden
            />
            <span
              className="animate-vq-tumble absolute -top-9 left-7 h-3.5 w-3.5 rounded-[40%] bg-[#7FB5D6]"
              style={{ animationDelay: "400ms" }}
              aria-hidden
            />
            <svg
              viewBox="0 0 11 14"
              className="animate-vq-jump absolute -top-6 left-12 h-4 w-3"
              style={{ animationDelay: "700ms" }}
              aria-hidden
            >
              <path
                d="M2 0.8 H6 V6.4 L9 9.2 A2.6 2.6 0 1 1 5.2 12.6 L2 9.6 Z"
                fill="#E86A8A"
              />
            </svg>
            <Sparkle
              color="#A5D8EC"
              className="animate-vq-twinkle absolute -top-11 left-4 h-3 w-3"
            />
          </div>
        ) : null}
        {activity === "trash" ? (
          <div className="relative">
            <Bin />
          </div>
        ) : null}
        {activity === "garden" ? (
          <div className="relative">
            <div className="animate-vq-pour">
              <Can />
            </div>
            {[0, 350, 700].map((delay, index) => (
              <Drop
                key={delay}
                className="animate-vq-drip absolute top-8 h-2.5 w-2"
                style={{ left: `${13 + index * 4}px`, animationDelay: `${delay}ms` }}
              />
            ))}
            <Flower className="animate-vq-bloom absolute -top-9 left-10 h-6 w-5" />
            {[0, 500].map((delay, index) => (
              <span
                key={delay}
                className="animate-vq-particle absolute -top-8 size-1.5 rounded-full bg-[#6FA85A]"
                style={
                  {
                    left: `${index * 12}px`,
                    animationDelay: `${delay}ms`,
                    "--vq-drift": index === 0 ? "14px" : "-10px",
                  } as CSSProperties
                }
                aria-hidden
              />
            ))}
          </div>
        ) : null}
      </div>

      {activity === "vacuum" ? (
        <div
          className="absolute bottom-[15%] left-[30%] w-[90px]"
          key={`vac-${activityKey}`}
          aria-hidden
        >
          <div className="animate-vq-patrol">
            <div className="animate-vq-bob">
              <Vacuum />
            </div>
          </div>
          {[0, 400, 800].map((delay) => (
            <Sparkle
              key={delay}
              color="#A8D5D0"
              className="animate-vq-particle absolute -left-6 bottom-1 h-3 w-3"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
          {[300, 900].map((delay, index) => (
            <span
              key={delay}
              className="animate-vq-twinkle absolute -bottom-1 size-1 rounded-full bg-[#8A6B4A]"
              style={{ left: `${6 + index * 14}px`, animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      ) : null}

      {!night && !active && !complete ? (
        <div
          className="animate-vq-fly absolute bottom-[34%] left-0"
          key="butterfly"
          aria-hidden
        >
          <Butterfly />
        </div>
      ) : null}

      {night && !active && !complete
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
            <Sparkle
              key={particle.id}
              color={particle.color}
              className="animate-vq-particle absolute h-3.5 w-3.5"
              style={
                {
                  "--vq-drift": `${particle.drift}px`,
                  animationDelay: `${particle.delay}ms`,
                } as CSSProperties
              }
            />
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

      {active || sleeping ? (
        <div className="animate-vq-float absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-[#221D17]/90 px-3 py-1 text-[11px] font-semibold text-[#FFF9F2] shadow-md">
          {active ? ACTIVITY_CAPTIONS[activity] : "Chut… Kotton dort. 💤"}
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
              <Sparkle
                key={index}
                color={particle.color}
                className="animate-vq-celebrate absolute top-0 h-4 w-4"
                style={{ left: `${particle.left}%`, animationDelay: `${particle.delay}ms` }}
              />
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
