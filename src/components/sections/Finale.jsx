import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Fireworks from "../ui/Fireworks";
import { CONFIG, interpolate } from "../../config";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export default function Finale({ onRestart }) {
  const scope = useRef(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) {
        gsap.set(".finale-fade", { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.from(".finale-fade", {
        y: 34,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.14,
        ease: "power3.out",
      });
    },
    { scope, dependencies: [reduced] },
  );

  return (
    <section ref={scope} className="section-shell py-16">
      <Fireworks className="absolute inset-0 z-0 h-full w-full" />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <span className="finale-fade inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[0.62rem] uppercase tracking-[0.34em] text-cream/60">
          {CONFIG.finaleKicker}
        </span>

        <h1 className="finale-fade mt-6 text-balance font-display text-4xl leading-[1.45] text-cream glow-text sm:text-6xl">
          {interpolate(CONFIG.finaleTitle)}
        </h1>

        <button type="button" onClick={onRestart} className="btn-ghost finale-fade ">
          {CONFIG.finaleRestart}
          <span aria-hidden="true">↺</span>
        </button>

        <p className="finale-fade mt-20 text-[0.65rem] uppercase tracking-[0.35em] text-cream/30">
          {interpolate(CONFIG.finaleNote)}
        </p>
      </div>
    </section>
  );
}
