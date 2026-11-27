type CatFacing = "left" | "right" | "front" | "back";

type CatAction =
  | "none"
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

type CatProps = {
  happy?: boolean;
  sleepy?: boolean;
  excited?: boolean;
  action?: CatAction;
  facing?: CatFacing;
  className?: string;
};

const ARM_CLASSES: Record<CatAction, string> = {
  none: "",
  sweep: "vq-arm-sweep",
  vacuum: "vq-arm-rest",
  dishes: "vq-arm-scrub",
  litter: "vq-arm-dig",
  laundry: "vq-arm-dig",
  dust: "vq-arm-reach",
  windows: "vq-arm-reach",
  trash: "vq-arm-push",
  garden: "vq-arm-rest",
  tidy: "vq-arm-push",
};

const FurDefs = () => (
  <defs>
    <linearGradient id="vq-fur" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FFAE63" />
      <stop offset="0.55" stopColor="#F0954F" />
      <stop offset="1" stopColor="#E08A3C" />
    </linearGradient>
    <linearGradient id="vq-fur-head" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FFB877" />
      <stop offset="1" stopColor="#F0954F" />
    </linearGradient>
  </defs>
);

export function KottonCat({
  happy = false,
  sleepy = false,
  excited = false,
  action = "none",
  facing = "front",
  className = "",
}: CatProps) {
  const armClass = ARM_CLASSES[action];
  const svgProps = {
    viewBox: "0 0 64 52",
    role: "img",
    "aria-label": "Kotton, le chat roux mascotte",
    className,
  };

  if (facing === "back") {
    return (
      <svg {...svgProps}>
        <FurDefs />
        <g className={happy ? undefined : `vq-cat-tail${excited ? " vq-cat-tail-fast" : ""}`}>
          <path
            d="M45 34 C56 31 58 22 53 13"
            fill="none"
            stroke="url(#vq-fur)"
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          <circle cx="53" cy="11.6" r="3.3" fill="#C96F2B" />
        </g>
        <g className="vq-cat-body">
          <ellipse cx="32" cy="37.5" rx="16.5" ry="11.5" fill="url(#vq-fur)" />
          <g stroke="#C96F2B" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.65">
            <path d="M20 31 Q26 34 32 34.2" />
            <path d="M38 30.5 Q43 31.5 47 30.6" />
          </g>
          {armClass ? (
            <g className={`vq-cat-arm-bl ${armClass}`}>
              <path
                d="M26 34 V42.5"
                stroke="url(#vq-fur)"
                strokeWidth="4.6"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="26" cy="43" r="2.6" fill="#FFF4E8" />
            </g>
          ) : null}
          {armClass ? (
            <g
              className={`vq-cat-arm-br ${armClass}`}
              style={{ animationDelay: "-250ms" }}
            >
              <path
                d="M38 34 V42.5"
                stroke="url(#vq-fur)"
                strokeWidth="4.6"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="38" cy="43" r="2.6" fill="#FFF4E8" />
            </g>
          ) : null}
          <ellipse cx="24.5" cy="47.5" rx="4.4" ry="2.6" fill="#FFF4E8" />
          <ellipse cx="39.5" cy="47.5" rx="4.4" ry="2.6" fill="#FFF4E8" />
          <g className="vq-cat-ear-l">
            <path
              d="M20.5 13 L23 2 L31 8.5 Z"
              fill="url(#vq-fur)"
              stroke="url(#vq-fur)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>
          <g className="vq-cat-ear-r">
            <path
              d="M33 8.5 L41 2 L43.5 13 Z"
              fill="url(#vq-fur)"
              stroke="url(#vq-fur)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>
          <circle cx="32" cy="19.5" r="13" fill="url(#vq-fur-head)" />
          <g stroke="#C96F2B" strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
            <path d="M27 9 V12" />
            <path d="M32 8.2 V11.6" />
            <path d="M37 9 V12" />
          </g>
        </g>
      </svg>
    );
  }

  if (facing === "front") {
    return (
      <svg {...svgProps}>
        <FurDefs />
        <g className={happy ? undefined : `vq-cat-tail${excited ? " vq-cat-tail-fast" : ""}`}>
          <path
            d="M46 36 C55 33 56 24 52 16"
            fill="none"
            stroke="url(#vq-fur)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="52" cy="14.6" r="3.1" fill="#C96F2B" />
        </g>
        <g className="vq-cat-body">
          <ellipse cx="32" cy="38" rx="16" ry="11" fill="url(#vq-fur)" />
          <ellipse cx="32" cy="41.5" rx="8.5" ry="6.5" fill="#FFF4E8" />
          {armClass ? (
            <g className={`vq-cat-arm-fl ${armClass}`}>
              <path
                d="M28 33 Q27 38 26.5 42.5"
                stroke="url(#vq-fur)"
                strokeWidth="4.6"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="26.5" cy="43" r="2.6" fill="#FFF4E8" />
            </g>
          ) : null}
          {armClass ? (
            <g
              className={`vq-cat-arm-fr ${armClass}`}
              style={{ animationDelay: "-250ms" }}
            >
              <path
                d="M36 33 Q36.8 38 37.5 42.5"
                stroke="url(#vq-fur)"
                strokeWidth="4.6"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="37.5" cy="43" r="2.6" fill="#FFF4E8" />
            </g>
          ) : null}
          <ellipse cx="25.5" cy="47.5" rx="4.4" ry="2.6" fill="#FFF4E8" />
          <ellipse cx="38.5" cy="47.5" rx="4.4" ry="2.6" fill="#FFF4E8" />
          <g className="vq-cat-ear-l">
            <path
              d="M20.5 13 L23 2 L31 8.5 Z"
              fill="url(#vq-fur)"
              stroke="url(#vq-fur)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M23.6 10.5 L24.6 5.2 L28.8 8.4 Z" fill="#F6B39B" />
          </g>
          <g className="vq-cat-ear-r">
            <path
              d="M33 8.5 L41 2 L43.5 13 Z"
              fill="url(#vq-fur)"
              stroke="url(#vq-fur)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M35.2 8.4 L39.4 5.2 L40.4 10.5 Z" fill="#F6B39B" />
          </g>
          <circle cx="32" cy="19" r="13.5" fill="url(#vq-fur-head)" />
          <g stroke="#C96F2B" strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
            <path d="M27 8.8 V11.8" />
            <path d="M32 8 V11.4" />
            <path d="M37 8.8 V11.8" />
          </g>
          {happy ? (
            <g stroke="#3E2C22" strokeWidth="1.8" strokeLinecap="round" fill="none">
              <path d="M23.5 19 Q26.5 15.8 29.5 19" />
              <path d="M34.5 19 Q37.5 15.8 40.5 19" />
            </g>
          ) : sleepy ? (
            <g stroke="#3E2C22" strokeWidth="1.8" strokeLinecap="round">
              <path d="M24 19 H29" />
              <path d="M35 19 H40" />
            </g>
          ) : (
            <g className="vq-cat-eyes">
              <circle cx="26.5" cy="18.5" r="2.4" fill="#3E2C22" />
              <circle cx="37.5" cy="18.5" r="2.4" fill="#3E2C22" />
              <circle cx="25.7" cy="17.7" r="0.8" fill="#FFF4E8" />
              <circle cx="36.7" cy="17.7" r="0.8" fill="#FFF4E8" />
            </g>
          )}
          {happy || sleepy ? null : (
            <g fill="#F6B39B" opacity="0.55">
              <circle cx="21.5" cy="23" r="2" />
              <circle cx="42.5" cy="23" r="2" />
            </g>
          )}
          <ellipse cx="32" cy="26" rx="7" ry="4.6" fill="#FFF4E8" />
          <path
            d="M30.6 23.2 H33.4 L32 25 Z"
            fill="#E0705A"
            stroke="#E0705A"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          <g stroke="#3E2C22" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.75">
            <path d="M32 25.4 V26.4" />
            <path d="M32 26.4 Q30.6 28 29.2 26.8" />
            <path d="M32 26.4 Q33.4 28 34.8 26.8" />
          </g>
          <g stroke="#3E2C22" strokeWidth="0.8" strokeLinecap="round" opacity="0.45">
            <path d="M18 23.5 L11 22.5" />
            <path d="M18 26 L11.5 27.5" />
            <path d="M46 23.5 L53 22.5" />
            <path d="M46 26 L52.5 27.5" />
          </g>
        </g>
      </svg>
    );
  }

  return (
    <svg {...svgProps}>
      <FurDefs />
      <g transform={facing === "right" ? "translate(64 0) scale(-1 1)" : undefined}>
        <g className={happy ? undefined : `vq-cat-tail${excited ? " vq-cat-tail-fast" : ""}`}>
          <path
            d="M44 32 C56 30 59 22 55 12"
            fill="none"
            stroke="url(#vq-fur)"
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          <circle cx="55" cy="10.6" r="3.3" fill="#C96F2B" />
          <circle cx="54.3" cy="11.6" r="1.1" fill="#FFB877" opacity="0.6" />
        </g>
        <g className="vq-cat-body">
          {armClass ? (
            <g
              className={`vq-cat-arm-far ${armClass}`}
              style={{ animationDelay: "-250ms" }}
            >
              <path
                d="M34 31 Q29 36 24 43"
                stroke="#E08A3C"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="23.5" cy="43.5" r="2.8" fill="#F0E0CC" />
            </g>
          ) : null}
          <ellipse cx="30" cy="38" rx="17" ry="11.5" fill="url(#vq-fur)" />
          <g stroke="#C96F2B" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.65">
            <path d="M18 30.5 Q23 33 28.5 33.2" />
            <path d="M36 29.5 Q40 31 44 30.4" />
          </g>
          <ellipse cx="28.5" cy="41.5" rx="9.5" ry="7" fill="#FFF4E8" />
          <ellipse cx="16.5" cy="47.5" rx="4.6" ry="2.7" fill="#FFF4E8" />
          <ellipse cx="40" cy="47.5" rx="4.6" ry="2.7" fill="#FFF4E8" />
          {armClass ? (
            <g className={`vq-cat-arm ${armClass}`}>
              <path
                d="M31 30 Q25 35 20 42.5"
                stroke="url(#vq-fur)"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="19.5" cy="43" r="2.8" fill="#FFF4E8" />
            </g>
          ) : null}
          <g className="vq-cat-ear-l">
            <path
              d="M13 13 L15.5 2 L23.5 8.5 Z"
              fill="url(#vq-fur)"
              stroke="url(#vq-fur)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M15.6 10.5 L16.6 5.2 L20.8 8.4 Z" fill="#F6B39B" />
          </g>
          <g className="vq-cat-ear-r">
            <path
              d="M26.5 8.5 L34.5 2 L37 13 Z"
              fill="url(#vq-fur)"
              stroke="url(#vq-fur)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M29.2 8.4 L33.4 5.2 L34.4 10.5 Z" fill="#F6B39B" />
          </g>
          <circle cx="25" cy="19" r="13.5" fill="url(#vq-fur-head)" />
          <g stroke="#C96F2B" strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
            <path d="M20 8.8 V11.8" />
            <path d="M24.5 8 V11.4" />
            <path d="M29 8.8 V11.8" />
          </g>
          {happy ? (
            <g stroke="#3E2C22" strokeWidth="1.8" strokeLinecap="round" fill="none">
              <path d="M16 19 Q19 15.8 22 19" />
              <path d="M28 19 Q31 15.8 34 19" />
            </g>
          ) : sleepy ? (
            <g stroke="#3E2C22" strokeWidth="1.8" strokeLinecap="round">
              <path d="M16.5 19 H21.5" />
              <path d="M28.5 19 H33.5" />
            </g>
          ) : (
            <g className="vq-cat-eyes">
              <circle cx="19" cy="18.5" r="2.4" fill="#3E2C22" />
              <circle cx="31" cy="18.5" r="2.4" fill="#3E2C22" />
              <circle cx="18.2" cy="17.7" r="0.8" fill="#FFF4E8" />
              <circle cx="30.2" cy="17.7" r="0.8" fill="#FFF4E8" />
            </g>
          )}
          {happy || sleepy ? null : (
            <g fill="#F6B39B" opacity="0.55">
              <circle cx="14.5" cy="23" r="2" />
              <circle cx="35.5" cy="23" r="2" />
            </g>
          )}
          <ellipse cx="25" cy="26" rx="6.6" ry="4.6" fill="#FFF4E8" />
          <path
            d="M23.6 23.2 H26.4 L25 25 Z"
            fill="#E0705A"
            stroke="#E0705A"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          <g stroke="#3E2C22" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.75">
            <path d="M25 25.4 V26.4" />
            <path d="M25 26.4 Q23.6 28 22.2 26.8" />
            <path d="M25 26.4 Q26.4 28 27.8 26.8" />
          </g>
          <g stroke="#3E2C22" strokeWidth="0.8" strokeLinecap="round" opacity="0.45">
            <path d="M11.5 23.5 L4.5 22.5" />
            <path d="M11.5 26 L4.8 27.5" />
            <path d="M38.5 23.5 L45.5 22.5" />
            <path d="M38.5 26 L45.2 27.5" />
          </g>
        </g>
      </g>
    </svg>
  );
}
