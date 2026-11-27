type PixelCatProps = {
  happy?: boolean;
  sleepy?: boolean;
  excited?: boolean;
  className?: string;
};

export function PixelCat({
  happy = false,
  sleepy = false,
  excited = false,
  className = "",
}: PixelCatProps) {
  return (
    <svg
      viewBox="0 0 32 26"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Kotton, le chat roux mascotte"
      className={className}
    >
      <g className={happy ? undefined : `vq-cat-tail${excited ? " vq-cat-tail-fast" : ""}`}>
        <rect x="23" y="14" width="2" height="3" fill="#F0954F" />
        <rect x="24" y="12" width="2" height="3" fill="#F0954F" />
        <rect x="25" y="9" width="2" height="4" fill="#F0954F" />
        <rect x="26" y="6" width="2" height="4" fill="#F0954F" />
        <rect x="26" y="6" width="2" height="2" fill="#C96F2B" />
      </g>
      <g className="vq-cat-body">
        <rect x="8" y="12" width="14" height="10" fill="#F0954F" />
        <rect x="11" y="14" width="6" height="7" fill="#FFF4E8" />
        <rect x="8" y="14" width="1" height="3" fill="#C96F2B" />
        <rect x="21" y="16" width="1" height="3" fill="#C96F2B" />
        <rect x="9" y="21" width="3" height="2" fill="#FFF4E8" />
        <rect x="17" y="21" width="3" height="2" fill="#FFF4E8" />
        <g className="vq-cat-ear-l">
          <rect x="7" y="2" width="3" height="3" fill="#F0954F" />
          <rect x="8" y="3" width="1" height="1" fill="#F6B39B" />
        </g>
        <g className="vq-cat-ear-r">
          <rect x="18" y="2" width="3" height="3" fill="#F0954F" />
          <rect x="19" y="3" width="1" height="1" fill="#F6B39B" />
        </g>
        <rect x="6" y="5" width="16" height="9" fill="#F0954F" />
        <rect x="11" y="5" width="1" height="2" fill="#C96F2B" />
        <rect x="14" y="5" width="1" height="2" fill="#C96F2B" />
        <rect x="17" y="5" width="1" height="2" fill="#C96F2B" />
        <rect x="11" y="10" width="6" height="3" fill="#FFF4E8" />
        {happy ? (
          <g fill="#3E2C22">
            <rect x="9" y="8" width="1" height="1" />
            <rect x="11" y="8" width="1" height="1" />
            <rect x="10" y="7" width="1" height="1" />
            <rect x="17" y="8" width="1" height="1" />
            <rect x="19" y="8" width="1" height="1" />
            <rect x="18" y="7" width="1" height="1" />
          </g>
        ) : sleepy ? (
          <g fill="#3E2C22">
            <rect x="9" y="9" width="2" height="1" />
            <rect x="17" y="9" width="2" height="1" />
          </g>
        ) : (
          <g className="vq-cat-eyes">
            <rect x="9" y="8" width="2" height="2" fill="#3E2C22" />
            <rect x="17" y="8" width="2" height="2" fill="#3E2C22" />
            <rect x="9" y="8" width="1" height="1" fill="#FFF4E8" />
            <rect x="17" y="8" width="1" height="1" fill="#FFF4E8" />
          </g>
        )}
        <rect x="14" y="10" width="2" height="1" fill="#E0705A" />
        <rect x="4" y="9" width="2" height="1" fill="#3E2C22" opacity="0.6" />
        <rect x="4" y="11" width="2" height="1" fill="#3E2C22" opacity="0.6" />
        <rect x="22" y="9" width="2" height="1" fill="#3E2C22" opacity="0.6" />
        <rect x="22" y="11" width="2" height="1" fill="#3E2C22" opacity="0.6" />
      </g>
    </svg>
  );
}
