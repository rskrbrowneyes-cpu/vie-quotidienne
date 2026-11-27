import type { CSSProperties } from "react";

import { PixelCat } from "./cat";

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

const PixelStar = ({ color, className = "", style }: { color: string; className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 7 7" shapeRendering="crispEdges" className={className} style={style} aria-hidden>
    <rect x="3" y="0" width="1" height="7" fill={color} />
    <rect x="0" y="3" width="7" height="1" fill={color} />
  </svg>
);

const PixelBroom = () => (
  <svg viewBox="0 0 18 44" shapeRendering="crispEdges" className="animate-vq-sweeping h-24 w-10">
    <rect x="8" y="0" width="2" height="26" fill="#C96F2B" />
    <rect x="8" y="4" width="2" height="1" fill="#E09A55" />
    <rect x="4" y="26" width="10" height="4" fill="#F6B39B" />
    <rect x="3" y="30" width="12" height="8" fill="#F6B39B" />
    <rect x="3" y="30" width="12" height="1" fill="#C96F2B" />
    <rect x="3" y="34" width="12" height="1" fill="#C96F2B" />
    <rect x="4" y="38" width="1" height="4" fill="#F6B39B" />
    <rect x="7" y="38" width="1" height="5" fill="#E8C29A" />
    <rect x="10" y="38" width="1" height="4" fill="#F6B39B" />
    <rect x="12" y="38" width="1" height="5" fill="#E8C29A" />
  </svg>
);

const PixelDuster = () => (
  <svg viewBox="0 0 16 44" shapeRendering="crispEdges" className="animate-vq-duster h-24 w-9">
    <rect x="7" y="12" width="2" height="32" fill="#C96F2B" />
    <rect x="4" y="2" width="8" height="3" fill="#F6B39B" />
    <rect x="2" y="5" width="12" height="3" fill="#F6B39B" />
    <rect x="4" y="8" width="8" height="4" fill="#E8A98F" />
    <rect x="6" y="0" width="4" height="2" fill="#E0705A" />
  </svg>
);

const PixelVacuum = () => (
  <svg viewBox="0 0 26 10" shapeRendering="crispEdges" className="animate-vq-vacuum h-7 w-[72px]">
    <rect x="1" y="4" width="24" height="4" fill="#3E2C22" />
    <rect x="2" y="1" width="22" height="4" fill="#FF7000" />
    <rect x="4" y="2" width="18" height="2" fill="#FFE9D6" />
    <rect x="12" y="2" width="2" height="2" fill="#3E2C22" />
    <rect x="20" y="2" width="2" height="2" fill="#E0705A" className="animate-vq-shine" />
    <rect x="0" y="5" width="2" height="2" fill="#3E2C22" />
    <rect x="24" y="5" width="2" height="2" fill="#3E2C22" />
  </svg>
);

const PixelLitterBox = () => (
  <svg viewBox="0 0 40 20" shapeRendering="crispEdges" className="h-14 w-28">
    <rect x="2" y="6" width="36" height="12" fill="#7C8794" />
    <rect x="4" y="8" width="32" height="10" fill="#F5F2EA" />
    <rect x="6" y="9" width="28" height="3" fill="#D9B98C" />
    <rect x="10" y="9" width="4" height="1" fill="#B98A56" />
    <rect x="24" y="10" width="3" height="1" fill="#B98A56" />
    <rect x="0" y="18" width="40" height="2" fill="#3E2C22" opacity="0.15" />
  </svg>
);

const PixelBasket = () => (
  <svg viewBox="0 0 26 18" shapeRendering="crispEdges" className="h-12 w-16">
    <rect x="2" y="4" width="22" height="3" fill="#C9A876" />
    <rect x="3" y="7" width="20" height="9" fill="#C9A876" />
    <rect x="5" y="9" width="16" height="1" fill="#B08A5A" />
    <rect x="5" y="12" width="16" height="1" fill="#B08A5A" />
    <rect x="7" y="0" width="3" height="4" fill="#FF8A33" />
    <rect x="13" y="1" width="4" height="3" fill="#7FB5D6" />
    <rect x="0" y="16" width="26" height="2" fill="#3E2C22" opacity="0.15" />
  </svg>
);

const PixelBin = () => (
  <svg viewBox="0 0 18 24" shapeRendering="crispEdges" className="h-14 w-11">
    <g className="animate-vq-lid">
      <rect x="2" y="2" width="14" height="2" fill="#9AA5B1" />
      <rect x="4" y="0" width="10" height="2" fill="#8D8071" />
    </g>
    <rect x="3" y="4" width="12" height="18" fill="#9AA5B1" />
    <rect x="3" y="4" width="2" height="18" fill="#B4BEC8" />
    <rect x="13" y="4" width="2" height="18" fill="#7C8794" />
    <rect x="6" y="8" width="2" height="10" fill="#7C8794" />
    <rect x="10" y="8" width="2" height="10" fill="#7C8794" />
  </svg>
);

const PixelZzz = ({ className = "", style }: { className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 4 4" shapeRendering="crispEdges" className={className} style={style} aria-hidden>
    <rect x="0" y="0" width="4" height="1" fill="#8D8071" />
    <rect x="2" y="1" width="1" height="1" fill="#8D8071" />
    <rect x="1" y="2" width="1" height="1" fill="#8D8071" />
    <rect x="0" y="3" width="4" height="1" fill="#8D8071" />
  </svg>
);

const PixelScoop = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 12 16" shapeRendering="crispEdges" className={className} aria-hidden>
    <rect x="5" y="0" width="2" height="9" fill="#C96F2B" />
    <rect x="2" y="9" width="8" height="6" fill="#9AA5B1" />
    <rect x="3" y="10" width="6" height="2" fill="#D9B98C" />
  </svg>
);

const PixelSqueegee = () => (
  <svg viewBox="0 0 10 26" shapeRendering="crispEdges" className="h-12 w-5" aria-hidden>
    <rect x="4" y="0" width="2" height="18" fill="#C96F2B" />
    <rect x="1" y="18" width="8" height="4" fill="#7FB5D6" />
    <rect x="1" y="22" width="8" height="2" fill="#A5D8EC" />
  </svg>
);

const PixelCan = () => (
  <svg viewBox="0 0 18 16" shapeRendering="crispEdges" className="h-10 w-11" aria-hidden>
    <rect x="3" y="5" width="11" height="10" fill="#8FA6AD" />
    <rect x="3" y="5" width="11" height="2" fill="#AFC3C9" />
    <rect x="14" y="3" width="4" height="2" fill="#8FA6AD" />
    <rect x="15" y="5" width="3" height="3" fill="#7C929A" />
    <rect x="0" y="0" width="2" height="6" fill="#8FA6AD" />
    <rect x="1" y="0" width="5" height="2" fill="#AFC3C9" />
  </svg>
);

const PixelFlower = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 7 12" shapeRendering="crispEdges" className={className} aria-hidden>
    <rect x="3" y="5" width="1" height="7" fill="#6FA85A" />
    <rect x="1" y="8" width="2" height="1" fill="#6FA85A" />
    <rect x="4" y="7" width="2" height="1" fill="#8BC34A" />
    <rect x="2" y="1" width="3" height="3" fill="#E86A8A" />
    <rect x="3" y="0" width="1" height="1" fill="#F08AA8" />
    <rect x="3" y="2" width="1" height="1" fill="#FFD97A" />
  </svg>
);

const PixelBag = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 10 12" shapeRendering="crispEdges" className={className} aria-hidden>
    <rect x="1" y="2" width="8" height="9" fill="#D9D2C4" />
    <rect x="1" y="2" width="8" height="2" fill="#C4BCAC" />
    <rect x="3" y="0" width="4" height="2" fill="#B4AC9C" />
  </svg>
);

const PixelBox = ({ className = "", style }: { className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 14 12" shapeRendering="crispEdges" className={className} style={style} aria-hidden>
    <rect x="0" y="0" width="14" height="12" fill="#C9A876" />
    <rect x="0" y="0" width="14" height="2" fill="#B08A5A" />
    <rect x="6" y="0" width="2" height="12" fill="#B08A5A" />
    <rect x="0" y="0" width="14" height="1" fill="#E0C79A" />
  </svg>
);

const PixelButterfly = () => (
  <svg viewBox="0 0 10 8" shapeRendering="crispEdges" className="h-3.5 w-4" aria-hidden>
    <g className="animate-vq-flap">
      <rect x="0" y="1" width="4" height="3" fill="#7FB5D6" />
      <rect x="0" y="4" width="3" height="2" fill="#5E96C4" />
      <rect x="6" y="1" width="4" height="3" fill="#7FB5D6" />
      <rect x="7" y="4" width="3" height="2" fill="#5E96C4" />
    </g>
    <rect x="4" y="1" width="2" height="6" fill="#3E2C22" />
  </svg>
);

const PixelRoom = ({
  night,
  complete,
  dishesActive,
}: {
  night: boolean;
  complete: boolean;
  dishesActive: boolean;
}) => (
  <svg
    viewBox="0 0 160 120"
    preserveAspectRatio="xMidYMax slice"
    shapeRendering="crispEdges"
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
      <filter id="vq-soft" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="1.4" />
      </filter>
    </defs>
    <rect x="0" y="0" width="160" height="92" fill="url(#vq-wall)" />
    <rect x="0" y="70" width="160" height="18" fill="#C4D2B4" />
    <rect x="0" y="70" width="160" height="1" fill="#B0C2A0" />
    <rect x="0" y="88" width="160" height="4" fill="#D9B98C" />
    <rect x="0" y="92" width="160" height="28" fill="url(#vq-floor)" />
    {[99, 106, 113, 120, 127, 134, 141, 148].map((y) => (
      <rect key={y} x="0" y={y} width="160" height="1" fill={WOOD_DARK} opacity="0.6" />
    ))}
    <rect x="24" y="93" width="1" height="5" fill={WOOD_DARK} opacity="0.6" />
    <rect x="72" y="100" width="1" height="5" fill={WOOD_DARK} opacity="0.6" />
    <rect x="120" y="93" width="1" height="5" fill={WOOD_DARK} opacity="0.6" />
    <rect x="48" y="114" width="1" height="5" fill={WOOD_DARK} opacity="0.6" />

    <rect x="104" y="8" width="42" height="40" fill={TRIM} />
    <g className={`transition-opacity duration-1000 ${night ? "opacity-100" : "opacity-0"}`}>
      <rect x="107" y="11" width="36" height="34" fill="#263149" />
      <g className="animate-vq-shine" style={{ animationDelay: "0s" }}>
        <rect x="111" y="15" width="1" height="1" fill="#FFF" />
      </g>
      <g className="animate-vq-shine" style={{ animationDelay: "1.1s" }}>
        <rect x="130" y="14" width="1" height="1" fill="#FFF" />
      </g>
      <g className="animate-vq-shine" style={{ animationDelay: "2.2s" }}>
        <rect x="138" y="22" width="1" height="1" fill="#FFF" />
      </g>
      <g className="animate-vq-shine" style={{ animationDelay: "0.7s" }}>
        <rect x="120" y="36" width="1" height="1" fill="#FFF" />
      </g>
      <rect x="114" y="17" width="6" height="6" fill="#FFF3C2" />
      <rect x="116" y="16" width="4" height="8" fill="#FFF3C2" />
      <rect x="113" y="18" width="8" height="4" fill="#FFF3C2" />
      <rect x="116" y="17" width="3" height="3" fill="#263149" />
    </g>
    <g className={`transition-opacity duration-1000 ${night ? "opacity-0" : "opacity-100"}`}>
      <rect x="107" y="11" width="36" height="34" fill="#A5D8EC" />
      <g className="animate-vq-glow" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <rect x="112" y="15" width="8" height="8" fill="#FFD97A" opacity="0.5" />
      </g>
      <rect x="114" y="17" width="4" height="4" fill="#FFD97A" />
      <rect x="115" y="16" width="2" height="6" fill="#FFE9A8" />
      <rect x="113" y="18" width="6" height="2" fill="#FFE9A8" />
      <g className="animate-vq-drift" style={{ animationDuration: "12s" }}>
        <rect x="124" y="24" width="8" height="2" fill="#FFF" />
        <rect x="126" y="23" width="4" height="1" fill="#FFF" />
      </g>
      <g className="animate-vq-drift" style={{ animationDuration: "16s", animationDelay: "2s" }}>
        <rect x="130" y="32" width="6" height="2" fill="#FFF" opacity="0.85" />
      </g>
    </g>
    <rect x="124" y="11" width="2" height="34" fill={TRIM} />
    <rect x="107" y="26" width="36" height="2" fill={TRIM} />
    <rect x="102" y="48" width="46" height="3" fill={WOOD_LIGHT} />
    <rect x="102" y="51" width="46" height="2" fill="#3E2C22" opacity="0.18" />

    {!night ? (
      <polygon points="108,51 146,51 118,120 62,120" fill="url(#vq-shaft)" />
    ) : null}

    <rect x="0" y="92" width="160" height="7" fill="url(#vq-ao)" />

    <rect x="12" y="14" width="18" height="14" fill="#8B5E34" />
    <rect x="14" y="16" width="14" height="10" fill="#FFF6E4" />
    <rect x="14" y="21" width="14" height="5" fill="#FFD9A8" />
    <rect x="14" y="24" width="14" height="2" fill="#6FA85A" />
    <rect x="23" y="17" width="2" height="2" fill="#FF7000" />

    <rect x="10" y="12" width="20" height="13" fill="#C9A876" />
    <rect x="12" y="14" width="16" height="9" fill="#D8EEF6" />
    <rect x="13" y="15" width="1" height="4" fill="#FFF" />
    <rect x="14" y="14" width="1" height="2" fill="#FFF" />

    <rect x="8" y="26" width="30" height="14" fill="#A8CFC4" />
    <rect x="8" y="32" width="30" height="1" fill="#8FB8AC" />
    <rect x="18" y="26" width="1" height="14" fill="#8FB8AC" />
    <rect x="28" y="26" width="1" height="14" fill="#8FB8AC" />
    <rect x="8" y="26" width="30" height="1" fill="#8FB8AC" />

    <rect x="66" y="54" width="30" height="3" fill="#B98A56" />
    <rect x="68" y="57" width="2" height="4" fill="#9A6B3F" />
    <rect x="92" y="57" width="2" height="4" fill="#9A6B3F" />
    <rect x="70" y="45" width="4" height="9" fill="#5E9691" />
    <rect x="75" y="47" width="4" height="7" fill="#E0A23C" />
    <rect x="80" y="44" width="4" height="10" fill="#E0705A" />
    <rect x="85" y="48" width="3" height="6" fill="#7FB5D6" />
    <rect x="70" y="45" width="4" height="1" fill="#7FC4BE" />
    <rect x="80" y="44" width="4" height="1" fill="#F09A85" />

    <rect x="20" y="33" width="3" height="4" fill="#9AA5B1" />
    <rect x="14" y="33" width="9" height="3" fill="#9AA5B1" />
    <rect x="14" y="36" width="3" height="4" fill="#9AA5B1" />
    <rect x="10" y="42" width="26" height="2" fill="#F0EBE0" />
    <rect x="11" y="44" width="24" height="7" fill="#FFF" />
    <rect x="11" y="49" width="24" height="2" fill="#D9D2C4" />
    <rect x="13" y="45" width="20" height="4" fill="#E8E4DC" />
    <rect x="12" y="51" width="22" height="2" fill="#C9A876" />
    <rect x="14" y="53" width="3" height="4" fill="#C9A876" />
    <rect x="28" y="53" width="3" height="4" fill="#C9A876" />
    <rect x="33" y="43" width="3" height="2" fill="#FF7000" />

    {dishesActive ? (
      <g>
        <rect x="15" y="38" width="2" height="14" fill="#7FB5D6" className="animate-vq-stream" />
        <rect x="11" y="40" width="3" height="3" fill="#FFF" className="animate-vq-rise" />
        <rect x="26" y="42" width="2" height="2" fill="#FFF" className="animate-vq-rise" style={{ animationDelay: "0.5s" }} />
        <rect x="20" y="38" width="2" height="2" fill="#FFF" className="animate-vq-rise" style={{ animationDelay: "1s" }} />
        <rect x="16" y="47" width="2" height="2" fill="#7FB5D6" className="animate-vq-drip" />
        <rect x="24" y="47" width="2" height="2" fill="#7FB5D6" className="animate-vq-drip" style={{ animationDelay: "0.45s" }} />
        <g className="animate-vq-scrub">
          <rect x="17" y="46" width="8" height="2" fill="#FFF" />
          <rect x="18" y="45" width="6" height="1" fill="#F0EBE0" />
        </g>
      </g>
    ) : null}

    <ellipse cx="52" cy="91" rx="10" ry="2.4" fill="#3E2C22" opacity="0.22" filter="url(#vq-soft)" />
    <rect x="44" y="38" width="4" height="2" fill={TRIM} />
    <rect x="45" y="40" width="2" height="6" fill="#C96F2B" />
    <rect x="47" y="46" width="2" height="8" fill="#C96F2B" />
    <rect x="49" y="54" width="2" height="10" fill="#C96F2B" />
    <rect x="50" y="64" width="2" height="10" fill="#C96F2B" />
    <rect x="51" y="74" width="2" height="4" fill="#C96F2B" />
    <rect x="47" y="78" width="10" height="12" fill="#F6B39B" />
    <rect x="47" y="82" width="10" height="1" fill="#C96F2B" />
    <rect x="47" y="86" width="10" height="1" fill="#C96F2B" />
    <rect x="47" y="90" width="10" height="2" fill="#E8C29A" />

    <ellipse cx="68" cy="91" rx="12" ry="2.4" fill="#3E2C22" opacity="0.22" filter="url(#vq-soft)" />
    <rect x="58" y="82" width="20" height="8" fill={TRIM} />
    <rect x="60" y="84" width="16" height="2" fill="#6E4526" />
    <rect x="60" y="76" width="16" height="2" fill="#FF8A33" />
    <rect x="58" y="78" width="20" height="5" fill="#FF7000" />
    <rect x="62" y="79" width="12" height="2" fill="#FFE9D6" />
    <rect x="67" y="79" width="2" height="2" fill="#3E2C22" />

    <ellipse cx="141" cy="91" rx="9" ry="2.2" fill="#3E2C22" opacity="0.22" filter="url(#vq-soft)" />
    <rect x="132" y="76" width="16" height="3" fill="#E08A3C" />
    <rect x="132" y="76" width="16" height="1" fill="#F5B271" />
    <rect x="134" y="79" width="12" height="11" fill="#C96F2B" />
    <rect x="134" y="79" width="2" height="11" fill="#B05E20" />
    <rect x="144" y="79" width="2" height="11" fill="#E08A3C" />
    <rect x="134" y="83" width="12" height="1" fill="#B05E20" />
    <g className="animate-vq-sway">
      <rect x="136" y="62" width="4" height="7" fill="#6FA85A" />
      <rect x="143" y="59" width="4" height="9" fill="#6FA85A" />
      <rect x="139" y="55" width="4" height="6" fill="#8BC34A" />
      <rect x="134" y="68" width="3" height="4" fill="#8BC34A" />
      <rect x="147" y="66" width="3" height="5" fill="#6FA85A" />
    </g>

    <ellipse cx="120" cy="90" rx="13" ry="2.4" fill="#3E2C22" opacity="0.22" filter="url(#vq-soft)" />
    <rect x="108" y="82" width="24" height="3" fill="#C9A876" />
    <rect x="110" y="85" width="20" height="4" fill="#B08A5A" />
    <rect x="111" y="83" width="18" height="3" fill="#DCE3C8" />
    <rect x="111" y="85" width="18" height="1" fill="#C4D2B4" />

    <rect x="66" y="98" width="48" height="16" fill="#7FB5B0" />
    <rect x="66" y="98" width="48" height="2" fill="#5E9691" />
    <rect x="66" y="112" width="48" height="2" fill="#5E9691" />
    <rect x="70" y="102" width="40" height="8" fill="#A8D5D0" opacity="0.75" />
    <rect x="86" y="104" width="8" height="4" fill="#FF8A66" />

    {complete ? (
      <g className="animate-vq-twinkle">
        <rect x="88" y="94" width="3" height="3" fill="#FFD97A" />
      </g>
    ) : null}
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
    <div
      className={`relative h-[38vh] max-h-[420px] min-h-[280px] overflow-hidden rounded-t-2xl border-2 border-b-0 border-accent bg-[#EAD8B4] ${
        celebrating ? "animate-vq-shake" : ""
      }`}
    >
      <PixelRoom night={night} complete={complete} dishesActive={activity === "dishes"} />

      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{ opacity: dirt }}
        aria-hidden
      >
        {DUST_MOTES.map((mote, index) => (
          <span
            key={index}
            className="animate-vq-particle absolute bg-[#C9B896]"
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
            <PixelStar
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

      <div className="absolute bottom-[13%] left-[6%] flex items-end gap-1">
        <div
          className="absolute bottom-[-4px] left-7 h-3 w-24 rounded-[50%] bg-[#3E2C22]/25 blur-[3px]"
          aria-hidden
        />
        <div key={`in-${activityKey}`} className="animate-vq-entrance relative">
          <div
            key={`hop-${hopKey}`}
            className={hopKey > 0 ? "animate-vq-hop" : undefined}
          >
            <div
              key={activityKey}
              className={celebrating ? "animate-vq-hops" : catPose}
            >
              <PixelCat
                happy={complete || celebrating}
                sleepy={sleeping}
                excited={active}
                className="size-32 drop-shadow-md"
              />
            </div>
          </div>
        </div>
        {sleeping
          ? [0, 700].map((delay, index) => (
              <PixelZzz
                key={delay}
                className={`animate-vq-rise absolute ${index === 0 ? "-top-9 left-1 h-3 w-3" : "-top-12 left-6 h-2 w-2"}`}
                style={{ animationDelay: `${delay}ms` }}
              />
            ))
          : null}
        {activity === "sweep" ? (
          <div className="relative">
            <div className="animate-vq-sway" style={{ animationDuration: "620ms" }}>
              <PixelBroom />
            </div>
            {[-12, -4, 4, 12, 18].map((drift, index) => (
              <span
                key={drift}
                className="animate-vq-particle absolute bottom-1 bg-[#C9B896]"
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
              <span className="size-1.5 bg-[#B8A688]" />
              <span className="size-1 bg-[#C9B896]" />
              <span className="size-1.5 bg-[#B8A688]" />
            </div>
          </div>
        ) : null}
        {activity === "dust" ? (
          <div className="relative">
            <PixelDuster />
            {[0, 300, 600].map((delay, index) => (
              <PixelStar
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
            <PixelStar
              color="#FFD97A"
              className="animate-vq-twinkle absolute -top-6 left-8 h-3.5 w-3.5"
            />
          </div>
        ) : null}
        {activity === "litter" ? (
          <div className="relative">
            <PixelLitterBox />
            <PixelScoop className="animate-vq-dig absolute -top-5 right-1 h-7 w-5" />
            {[-14, 12, -6, 18, 4, -18].map((drift, index) => (
              <span
                key={drift}
                className="animate-vq-toss absolute bottom-7 size-1.5 bg-[#D9B98C]"
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
            <PixelBasket />
            <svg
              viewBox="0 0 8 8"
              shapeRendering="crispEdges"
              className="animate-vq-tumble absolute -top-7 left-1 h-4 w-4"
              aria-hidden
            >
              <rect x="1" y="1" width="6" height="6" fill="#FF8A33" />
              <rect x="1" y="1" width="2" height="2" fill="#FF7000" />
            </svg>
            <svg
              viewBox="0 0 8 8"
              shapeRendering="crispEdges"
              className="animate-vq-tumble absolute -top-9 left-7 h-3.5 w-3.5"
              style={{ animationDelay: "400ms" }}
              aria-hidden
            >
              <rect x="1" y="1" width="6" height="6" fill="#7FB5D6" />
              <rect x="4" y="4" width="2" height="2" fill="#A5D8EC" />
            </svg>
            <svg
              viewBox="0 0 6 8"
              shapeRendering="crispEdges"
              className="animate-vq-jump absolute -top-6 left-12 h-4 w-3"
              style={{ animationDelay: "700ms" }}
              aria-hidden
            >
              <rect x="1" y="0" width="4" height="6" fill="#E86A8A" />
              <rect x="1" y="6" width="2" height="2" fill="#D15A79" />
            </svg>
            <PixelStar
              color="#A5D8EC"
              className="animate-vq-twinkle absolute -top-11 left-4 h-3 w-3"
            />
          </div>
        ) : null}
        {activity === "trash" ? (
          <div className="relative">
            <PixelBag className="animate-vq-drop-in absolute -top-8 left-2 h-4 w-3.5" />
            <PixelBin />
          </div>
        ) : null}
        {activity === "tidy" ? (
          <div className="relative h-14 w-12">
            <PixelBox className="animate-vq-drop-in absolute bottom-0 left-0 h-8 w-9" />
            <PixelBox
              className="animate-vq-drop-in absolute bottom-7 left-1 h-7 w-8"
              style={{ animationDelay: "260ms" }}
            />
            <PixelBox
              className="animate-vq-drop-in absolute bottom-13 left-2 h-6 w-7"
              style={{ animationDelay: "520ms" }}
            />
            <PixelStar
              color="#FFD97A"
              className="animate-vq-twinkle absolute -top-2 left-8 h-3.5 w-3.5"
              style={{ animationDelay: "900ms" }}
            />
          </div>
        ) : null}
        {activity === "garden" ? (
          <div className="relative">
            <div className="animate-vq-pour">
              <PixelCan />
            </div>
            {[0, 350, 700].map((delay, index) => (
              <span
                key={delay}
                className="animate-vq-drip absolute top-8 text-[9px] text-[#7FB5D6]"
                style={{ left: `${12 + index * 4}px`, animationDelay: `${delay}ms` }}
                aria-hidden
              >
                ▼
              </span>
            ))}
            <PixelFlower className="animate-vq-bloom absolute -top-9 left-10 h-6 w-4" />
            {[0, 500].map((delay, index) => (
              <span
                key={delay}
                className="animate-vq-particle absolute -top-8 size-1.5 bg-[#6FA85A]"
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
        {activity === "windows" ? (
          <PixelStar
            color="#FFE9D6"
            className="animate-vq-twinkle absolute -top-10 h-4 w-4"
          />
        ) : null}
        {activity === "windows" ? (
          <div
            className="absolute right-[7%] top-[10%] flex items-center gap-2"
            aria-hidden
          >
            <div className="h-6 w-10 -skew-x-12 bg-white/50 blur-[2px] animate-vq-squeegee" />
            <div className="animate-vq-squeegee" style={{ animationDelay: "200ms" }}>
              <PixelSqueegee />
            </div>
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
              <PixelVacuum />
            </div>
          </div>
          {[0, 400, 800].map((delay) => (
            <PixelStar
              key={delay}
              color="#A8D5D0"
              className="animate-vq-particle absolute -left-6 bottom-1 h-3 w-3"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
          {[300, 900].map((delay, index) => (
            <span
              key={delay}
              className="animate-vq-twinkle absolute -bottom-1 size-1 bg-[#8A6B4A]"
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
          <PixelButterfly />
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
            <PixelStar
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
                particle.kind === "bub" ? "size-2.5 rounded-full" : "size-2"
              }`}
              style={
                {
                  backgroundColor: particle.color,
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
              <PixelStar
                key={index}
                color={particle.color}
                className="animate-vq-celebrate absolute top-0 h-4 w-4"
                style={{ left: `${particle.left}%`, animationDelay: `${particle.delay}ms` }}
              />
            ) : (
              <span
                key={index}
                className="animate-vq-celebrate absolute top-0 size-2.5"
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
