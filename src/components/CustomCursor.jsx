import { useEffect, useRef } from "react";
import { getPointer } from "../utils/pointer";
import { lerp } from "../utils/math";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const pointer = getPointer();
    if (!pointer.finePointer) return undefined;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    let ringX = pointer.x;
    let ringY = pointer.y;
    let scale = 1;
    let targetScale = 1;
    let visible = false;
    let frame = 0;

    const interactiveSelector = "a, button, [data-cursor='hover'], input, textarea";

    const onOver = (event) => {
      targetScale = event.target.closest?.(interactiveSelector) ? 1.9 : 1;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const onEnter = () => {
      visible = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    const tick = () => {
      ringX = lerp(ringX, pointer.x, 0.22);
      ringY = lerp(ringY, pointer.y, 0.22);
      scale = lerp(scale, targetScale, 0.22);
      dot.style.transform = `translate3d(${pointer.x - 3}px, ${pointer.y - 3}px, 0)`;
      ring.style.transform = `translate3d(${ringX - 18}px, ${ringY - 18}px, 0) scale(${scale.toFixed(3)})`;
      frame = requestAnimationFrame(tick);
    };

    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    if (pointer.active) onEnter();
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] hidden [@media(pointer:fine)]:block">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-9 w-9 rounded-full border border-rose/70 opacity-0 transition-opacity duration-300"
        style={{
          boxShadow: "0 0 20px rgba(255,143,171,0.35)",
          willChange: "transform",
        }}
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-peach opacity-0"
        style={{ willChange: "transform" }}
      />
    </div>
  );
}
