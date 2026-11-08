import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";
import { getPointer } from "../utils/pointer";
import { tilt } from "../utils/tilt";
import { lerp } from "../utils/math";

export function useParallax(depth = 20, strength = 0.08) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return undefined;

    const pointer = getPointer();
    let x = 0;
    let y = 0;
    let frame = 0;

    const tick = () => {
      const source = pointer.finePointer || !tilt.active ? pointer : tilt;
      const targetX = source.nx * depth;
      const targetY = source.ny * depth;
      x = lerp(x, targetX, strength);
      y = lerp(y, targetY, strength);
      node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [depth, strength, reduced]);

  return ref;
}
