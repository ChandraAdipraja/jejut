const GRADIENTS = {
  rose: "radial-gradient(circle at 32% 26%, #ffd0dc 0%, #ff8fab 42%, #e0577f 100%)",
  lilac: "radial-gradient(circle at 32% 26%, #f0d6ff 0%, #c77dff 45%, #8c4dcc 100%)",
  peach: "radial-gradient(circle at 32% 26%, #fff0d6 0%, #ffd6a5 45%, #eda75c 100%)",
  sky: "radial-gradient(circle at 32% 26%, #d9f4ff 0%, #8ecae6 45%, #4f92b8 100%)",
};

function BalloonShape({ size, gradient }) {
  return (
    <div className="relative mx-auto" style={{ width: size, aspectRatio: "3 / 4" }}>
      <span
        className="absolute inset-0 rounded-[50%_50%_46%_46%/52%_52%_48%_48%] shadow-[inset_-8px_-12px_20px_rgba(0,0,0,0.18),inset_5px_7px_16px_rgba(255,255,255,0.3)]"
        style={{ background: gradient }}
      />
      <span className="absolute left-[22%] top-[16%] h-[22%] w-[16%] rotate-[-24deg] rounded-full bg-white/50 blur-[1px]" />
      <span
        className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-[2px]"
        style={{ background: gradient }}
      />
    </div>
  );
}

function Note({ width }) {
  return (
    <div
      className="mx-auto -mt-1 rotate-[-4deg] rounded-[2px] bg-[#fff6ef]/90 px-1.5 py-1.5 shadow-[0_8px_18px_rgba(6,6,24,0.4)]"
      style={{ width }}
    >
      <span className="block h-px w-3/4 bg-night/25" />
      <span className="mt-1 block h-px w-full bg-night/15" />
      <span className="mt-1 block h-px w-2/3 bg-night/15" />
    </div>
  );
}

export default function WishBalloon({
  color = "rose",
  left = 10,
  size = 62,
  duration = 24,
  delay = 0,
  sway = 18,
  noteWidth = 38,
  opacity = 0.42,
  top = 20,
  static: isStatic = false,
}) {
  const gradient = GRADIENTS[color] ?? GRADIENTS.rose;

  if (isStatic) {
    return (
      <div
        aria-hidden="true"
        data-wish-balloon
        className="pointer-events-none absolute"
        style={{ left: `${left}%`, top: `${top}%`, width: size, opacity }}
      >
        <BalloonShape size={size} gradient={gradient} />
        <svg
          viewBox="0 0 20 70"
          className="mx-auto h-12 w-4 opacity-45"
          aria-hidden="true"
        >
          <path
            d="M10 0 C 2 14, 18 28, 10 44 C 4 56, 16 62, 10 70"
            fill="none"
            stroke="#fff6ef"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
        <Note width={noteWidth} />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      data-wish-balloon
      className="wish-balloon pointer-events-none absolute bottom-0"
      style={{
        left: `${left}%`,
        width: size,
        opacity,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      <div
        className="wish-balloon-sway"
        style={{
          "--sway": `${sway}px`,
          animationDuration: `${Math.max(5, duration / 3)}s`,
        }}
      >
        <BalloonShape size={size} gradient={gradient} />
        <svg
          viewBox="0 0 20 70"
          className="mx-auto h-12 w-4 opacity-45"
          aria-hidden="true"
        >
          <path
            d="M10 0 C 2 14, 18 28, 10 44 C 4 56, 16 62, 10 70"
            fill="none"
            stroke="#fff6ef"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
        <Note width={noteWidth} />
      </div>
    </div>
  );
}

