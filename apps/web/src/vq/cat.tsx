type GingerCatProps = {
  happy?: boolean;
  className?: string;
};

export function GingerCat({ happy = false, className = "" }: GingerCatProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label="Kotton, le chat roux mascotte"
      className={className}
    >
      <g className={happy ? undefined : "vq-cat-tail"}>
        <path
          d="M92 84 C 106 82, 112 70, 108 56"
          fill="none"
          stroke="#F0954F"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M92 84 C 104 82, 109 72, 106.5 61"
          fill="none"
          stroke="#C96F2B"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>
      <ellipse cx="60" cy="88" rx="30" ry="22" fill="#F0954F" />
      <ellipse cx="60" cy="94" rx="18" ry="13" fill="#FFF4E8" />
      <path d="M36 74 Q 44 84 40 96" fill="none" stroke="#C96F2B" strokeWidth="4" strokeLinecap="round" />
      <path d="M84 74 Q 78 84 81 96" fill="none" stroke="#C96F2B" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="42" cy="106" rx="8" ry="5.5" fill="#FFF4E8" />
      <ellipse cx="78" cy="106" rx="8" ry="5.5" fill="#FFF4E8" />
      <path d="M36 46 L 38 24 L 56 36 Z" fill="#F0954F" />
      <path d="M38 40 L 39 28 L 50 35 Z" fill="#F6B39B" />
      <path d="M84 46 L 82 24 L 64 36 Z" fill="#F0954F" />
      <path d="M82 40 L 81 28 L 70 35 Z" fill="#F6B39B" />
      <circle cx="60" cy="54" r="30" fill="#F0954F" />
      <path d="M32 46 Q 34 38 40 33" fill="none" stroke="#C96F2B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <path d="M88 46 Q 86 38 80 33" fill="none" stroke="#C96F2B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="60" cy="68" rx="13" ry="9" fill="#FFF4E8" />
      {happy ? (
        <g stroke="#3E2C22" strokeWidth="3.4" strokeLinecap="round" fill="none">
          <path d="M42 50 Q 47 44 52 50" />
          <path d="M68 50 Q 73 44 78 50" />
        </g>
      ) : (
        <g className="vq-cat-eyes">
          <circle cx="47" cy="50" r="4.6" fill="#3E2C22" />
          <circle cx="73" cy="50" r="4.6" fill="#3E2C22" />
          <circle cx="48.6" cy="48.4" r="1.4" fill="#FFF4E8" />
          <circle cx="74.6" cy="48.4" r="1.4" fill="#FFF4E8" />
        </g>
      )}
      <path d="M56 60 Q 60 64 64 60 Q 60 66.5 56 60 Z" fill="#E0705A" />
      <path
        d="M60 64 L 60 68 M 60 68 Q 55 71 51 68 M 60 68 Q 65 71 69 68"
        fill="none"
        stroke="#3E2C22"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <g stroke="#3E2C22" strokeWidth="1.6" strokeLinecap="round" opacity="0.75">
        <path d="M34 58 L 20 55" />
        <path d="M34 62 L 21 63" />
        <path d="M86 58 L 100 55" />
        <path d="M86 62 L 99 63" />
      </g>
    </svg>
  );
}
