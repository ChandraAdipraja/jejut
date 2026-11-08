import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import TypewriterText from "../ui/TypewriterText";
import { CONFIG, interpolate } from "../../config";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export default function Message({ onNext }) {
  const scope = useRef(null);
  const cardRef = useRef(null);
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();

  const lines = useMemo(
    () => CONFIG.finalMessage.map((line) => interpolate(line)),
    [],
  );

  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card || reduced) return undefined;

      const rotateX = gsap.quickTo(card, "rotationX", {
        duration: 0.55,
        ease: "power2.out",
      });
      const rotateY = gsap.quickTo(card, "rotationY", {
        duration: 0.55,
        ease: "power2.out",
      });

      const onMove = (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        rotateY(x * 14);
        rotateX(-y * 10);
      };

      const onLeave = () => {
        rotateX(0);
        rotateY(0);
      };

      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);

      return () => {
        card.removeEventListener("pointermove", onMove);
        card.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope, dependencies: [reduced] },
  );

  useEffect(() => {
    if (!done || reduced) return undefined;
    const animation = gsap.fromTo(
      ".message-signature",
      { autoAlpha: 0, y: 18, filter: "blur(6px)" },
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1,
        ease: "power3.out",
        delay: 0.3,
      },
    );
    return () => animation.kill();
  }, [done, reduced]);

  return (
    <section ref={scope} className="section-shell py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_20%,rgba(199,125,255,0.16)_0%,transparent_70%)]"
      />

      <div className="w-full max-w-xl [perspective:1400px]">
        <div
          ref={cardRef}
          className="glass-card relative rounded-3xl px-6 py-8 will-change-transform sm:px-10 sm:py-11"
          style={{ transformStyle: "preserve-3d" }}
        >
          <span
            aria-hidden="true"
            className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-rose/25 blur-md"
          />

          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sm">
              💌
            </span>
            <h2 className="font-display text-lg text-cream/90 sm:text-xl">
              {CONFIG.messageTitle}
            </h2>
          </div>

          <TypewriterText
            lines={lines}
            speed={CONFIG.messageSpeed}
            instant={reduced}
            onDone={() => setDone(true)}
            className="min-h-[9.5rem] space-y-3 font-body text-[0.95rem] leading-relaxed text-cream/85 sm:text-base"
            lineClassName="text-balance"
          >
            {({ done: typingDone, fast, skip }) => (
              <div className="mt-8 flex flex-col items-start gap-5">
                {!typingDone ? (
                  <button
                    type="button"
                    onClick={skip}
                    disabled={fast}
                    className="btn-ghost text-[0.7rem] disabled:opacity-40"
                  >
                    {CONFIG.messageSkip}
                  </button>
                ) : null}

                <div
                  className={`message-signature flex w-full items-center justify-between gap-4 transition-opacity duration-500 ${
                    typingDone ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <p className="font-display text-lg text-rose sm:text-xl">
                    {interpolate(CONFIG.signature)}
                  </p>
                  <div className="flex gap-1.5 text-sm" aria-hidden="true">
                    {["🤍", "✨", "💗"].map((heart, index) => (
                      <span
                        key={heart}
                        className="animate-float inline-block"
                        style={{ animationDelay: `${index * 0.4}s` }}
                      >
                        {heart}
                      </span>
                    ))}
                  </div>
                </div>

                {typingDone ? (
                  <button type="button" onClick={onNext} className="btn-primary">
                    {CONFIG.messageNext}
                  </button>
                ) : null}
              </div>
            )}
          </TypewriterText>
        </div>
      </div>
    </section>
  );
}
