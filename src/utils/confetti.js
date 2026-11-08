import confetti from "canvas-confetti";

const COLORS = ["#ff8fab", "#c77dff", "#ffd6a5", "#fff6ef", "#8ecae6"];

let heartShape = null;
const getHeartShape = () => {
  if (heartShape) return heartShape;
  if (typeof confetti.shapeFromPath !== "function") return null;
  heartShape = confetti.shapeFromPath({
    path: "M12 21s-6.7-4.35-9.2-8.1C.9 9.9 2.1 6.2 5.3 5.1c1.9-.66 3.9.03 5.03 1.55L12 8.5l1.67-1.85c1.13-1.52 3.13-2.21 5.03-1.55 3.2 1.1 4.4 4.8 2.5 7.8C18.7 16.65 12 21 12 21z",
    matrix: [1.6, 0, 0, 1.6, -9.6, -9.6],
  });
  return heartShape;
};

export const burst = (options = {}) => {
  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.65 },
    colors: COLORS,
    zIndex: 60,
    disableForReducedMotion: true,
    ...options,
  });
};

export const sideCannons = (options = {}) => {
  const shared = {
    particleCount: 80,
    spread: 62,
    startVelocity: 55,
    colors: COLORS,
    zIndex: 60,
    disableForReducedMotion: true,
    ...options,
  };
  confetti({ ...shared, angle: 60, origin: { x: 0, y: 0.75 } });
  confetti({ ...shared, angle: 120, origin: { x: 1, y: 0.75 } });
};

export const heartBurst = (origin = { x: 0.5, y: 0.6 }, count = 24) => {
  const shape = getHeartShape();
  confetti({
    particleCount: count,
    spread: 70,
    startVelocity: 26,
    gravity: 0.7,
    scalar: shape ? 1.6 : 1,
    ticks: 160,
    shapes: shape ? [shape] : undefined,
    colors: ["#ff8fab", "#ff5d8f", "#ffd6a5"],
    origin,
    zIndex: 60,
    disableForReducedMotion: true,
  });
};


