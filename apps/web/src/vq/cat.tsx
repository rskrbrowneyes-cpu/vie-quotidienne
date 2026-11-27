type CatProps = {
  happy?: boolean;
  sleepy?: boolean;
  excited?: boolean;
  className?: string;
};

export function KottonCat({
  happy = false,
  sleepy = false,
  excited = false,
  className = "",
}: CatProps) {
  return (
    <svg
      viewBox="0 0 64 52"
      role="img"
      aria-label="Kotton, le chat roux mascotte"
      className={className}
    >
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
        <ellipse cx="30" cy="38" rx="17" ry="11.5" fill="url(#vq-fur)" />
        <g stroke="#C96F2B" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.65">
          <path d="M18 30.5 Q23 33 28.5 33.2" />
          <path d="M36 29.5 Q40 31 44 30.4" />
        </g>
        <ellipse cx="28.5" cy="41.5" rx="9.5" ry="7" fill="#FFF4E8" />
        <ellipse cx="16.5" cy="47.5" rx="4.6" ry="2.7" fill="#FFF4E8" />
        <ellipse cx="40" cy="47.5" rx="4.6" ry="2.7" fill="#FFF4E8" />
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
    </svg>
  );
}
