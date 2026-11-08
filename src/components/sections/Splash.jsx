import { useEffect, useRef, useState } from "react";
import { CONFIG } from "../../config";
import { burst } from "../../utils/confetti";

const STEP_MS = 5000;
const HOLD_MS = 5000;
const TOTAL_MS = CONFIG.splashSteps.length * STEP_MS;

export default function Splash({ onDone }) {
  const steps = CONFIG.splashSteps;
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const timers = [];

    steps.forEach((_, stepIndex) => {
      if (stepIndex === 0) return;
      timers.push(setTimeout(() => setIndex(stepIndex), stepIndex * STEP_MS));
    });

    timers.push(setTimeout(() => setHolding(true), TOTAL_MS));
    timers.push(
      setTimeout(() => {
        burst({ origin: { x: 0.5, y: 0.45 }, particleCount: 100, spread: 100 });
        doneRef.current?.();
      }, TOTAL_MS + HOLD_MS),
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [steps]);

  useEffect(() => {
    let frame = 0;
    let value = 0;
    let last = performance.now();

    const tick = (now) => {
      const delta = Math.min(now - last, 64);
      last = now;
      value = Math.min(100, value + (delta / TOTAL_MS) * 100);
      setProgress(value);
      if (value < 100) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const step = steps[index];

  return (
    <section className="section-shell overflow-hidden">
      <div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
        <p className="text-[0.7rem] uppercase tracking-[0.5em] text-cream/50">
          {CONFIG.ui.splashKicker}
        </p>

        <div className="relative grid h-60 w-60 place-items-center sm:h-72 sm:w-72">
          <div
            aria-hidden="true"
            className="absolute inset-2 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute inset-8 rounded-full bg-rose/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute inset-6 rounded-full border border-dashed border-white/10 animate-[spin_24s_linear_infinite]"
          />

          <span
            aria-hidden="true"
            className="absolute left-3 top-8 text-lg text-peach animate-twinkle"
          >
            ✦
          </span>
          <span
            aria-hidden="true"
            className="absolute right-4 top-16 text-sm text-lilac animate-twinkle"
            style={{ animationDelay: "0.8s" }}
          >
            ✦
          </span>
          <span
            aria-hidden="true"
            className="absolute bottom-12 left-6 text-sm text-rose animate-twinkle"
            style={{ animationDelay: "1.4s" }}
          >
            ✦
          </span>
          <span
            aria-hidden="true"
            className="absolute bottom-8 right-8 text-xs text-cream/60 animate-twinkle"
            style={{ animationDelay: "0.4s" }}
          >
            ✦
          </span>

          <div key={`icon-${index}`} className="animate-icon-in">
            <div className="animate-bob">
              {step.image ? (
                <img
                  data-splash-icon
                  src={`${import.meta.env.BASE_URL}${step.image}`}
                  alt=""
                  className="h-28 w-28 object-contain sm:h-36 sm:w-36"
                />
              ) : (
                <span
                  data-splash-icon
                  className="text-[5.5rem] leading-none sm:text-[7rem]"
                >
                  {step.icon ?? "✨"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="min-h-16" aria-live="polite">
          <p
            key={`text-${index}`}
            data-splash-caption
            className="animate-fade-up text-balance px-2 text-sm leading-relaxed text-cream/80 sm:text-base"
          >
            {step.text}
          </p>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto flex w-full max-w-xl items-end justify-between px-5 pb-2.5 text-[0.6rem] uppercase tracking-[0.32em] text-cream/45 sm:px-8">
          <span>{holding ? CONFIG.splashReady : CONFIG.splashLoading}</span>
          <span data-splash-percent className="tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/10">
          <div
            className="h-full rounded-r-full bg-gradient-to-r from-rose via-lilac to-peach shadow-[0_0_18px_rgba(199,125,255,0.55)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
