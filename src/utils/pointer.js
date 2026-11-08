const KEY = "__birthdayPointer__";

const createState = () => ({
  x: typeof window === "undefined" ? 0 : window.innerWidth / 2,
  y: typeof window === "undefined" ? 0 : window.innerHeight / 2,
  nx: 0,
  ny: 0,
  active: false,
  finePointer:
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches,
  reducedMotion:
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});

const state =
  typeof window !== "undefined" ? (window[KEY] ||= createState()) : createState();

const subscribers = new Set();

const emit = () => {
  for (const callback of subscribers) callback(state);
};

const handleMove = (event) => {
  const point = event.touches?.[0] ?? event;
  if (typeof point.clientX !== "number") return;
  state.x = point.clientX;
  state.y = point.clientY;
  state.nx = (point.clientX / window.innerWidth) * 2 - 1;
  state.ny = (point.clientY / window.innerHeight) * 2 - 1;
  if (!state.active) {
    state.active = true;
  }
  emit();
};

let bound = false;
const bind = () => {
  if (bound || typeof window === "undefined") return;
  bound = true;
  window.addEventListener("pointermove", handleMove, { passive: true });
  window.addEventListener("touchmove", handleMove, { passive: true });
  window.addEventListener("pointerdown", handleMove, { passive: true });
};

export const getPointer = () => {
  bind();
  return state;
};

export const subscribePointer = (callback) => {
  bind();
  subscribers.add(callback);
  return () => subscribers.delete(callback);
};
