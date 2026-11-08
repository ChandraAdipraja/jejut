import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import WishBalloon from "../ui/WishBalloon";
import { CONFIG } from "../../config";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { randomBetween } from "../../utils/math";

const COLORS = ["rose", "lilac", "peach", "sky"];
const FLY_MS = 2200;
const HOLD_MS = 3000;
const WISH_MAX = 160;

const makeBalloon = (id) => ({
  id,
  color: COLORS[id % COLORS.length],
  left: randomBetween(4, 84),
  size: randomBetween(42, 72),
  duration: randomBetween(20, 32),
  delay: -randomBetween(0, 32),
  sway: randomBetween(10, 26),
  noteWidth: randomBetween(30, 44),
  top: randomBetween(8, 76),
  opacity: randomBetween(0.34, 0.6),
});

export default function Wish({ onNext }) {
  const reduced = useReducedMotion();
  const balloons = useMemo(
    () => Array.from({ length: 10 }, (_, index) => makeBalloon(index)),
    [],
  );
  const [open, setOpen] = useState(false);
  const [wish, setWish] = useState("");
  const [sent, setSent] = useState(false);
  const [paperGone, setPaperGone] = useState(false);
  const paperRef = useRef(null);
  const inputRef = useRef(null);
  const sentRef = useRef(false);
  const timers = useRef([]);
  const nextRef = useRef(onNext);
  nextRef.current = onNext;

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];
  }, []);

  useEffect(
    () => () => {
      clearTimers();
      if (paperRef.current) gsap.killTweensOf(paperRef.current);
    },
    [clearTimers],
  );

  useEffect(() => {
    if (!open) return undefined;
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 80);
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const sendWish = () => {
    if (!wish.trim() || sentRef.current) return;
    sentRef.current = true;
    setOpen(false);
    setSent(true);

    const flightMs = reduced ? 0 : FLY_MS;

    if (!reduced && paperRef.current) {
      gsap.to(paperRef.current, {
        y: -window.innerHeight * 1.15,
        x: randomBetween(-80, 80),
        rotation: randomBetween(-14, 14),
        scale: 0.72,
        autoAlpha: 0,
        duration: FLY_MS / 1000,
        ease: "power2.in",
      });
    }

    const hideTimer = setTimeout(() => setPaperGone(true), flightMs);
    const nextTimer = setTimeout(
      () => nextRef.current?.(),
      flightMs + HOLD_MS,
    );
    timers.current.push(hideTimer, nextTimer);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendWish();
  };

  const handleKeyDown = (event) => {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }
    event.preventDefault();
    sendWish();
  };

  return (
    <section className="section-shell py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {balloons.map((balloon) => (
          <WishBalloon
            key={balloon.id}
            {...balloon}
            static={reduced}
          />
        ))}
      </div>

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">

        <h1 className="mt-3 max-w-lg text-balance font-display text-3xl leading-snug text-cream glow-text sm:text-5xl">
          {CONFIG.wishTitle}
        </h1>

        {!paperGone ? (
          <button
            ref={paperRef}
            type="button"
            onClick={() => setOpen(true)}
            disabled={sent}
            aria-haspopup="dialog"
            aria-label={CONFIG.wishPaperLabel}
            className="wish-paper group relative z-20 mt-10 block w-[17rem] max-w-[80vw] text-left disabled:cursor-default"
          >
            <span className="wish-paper-sheet relative block rotate-[-1.2deg] rounded-[1.4rem] border border-cream/75 bg-[linear-gradient(160deg,#fffaf3_0%,#fff0e0_100%)] px-6 py-6 text-night-deep shadow-[0_28px_70px_-28px_rgba(6,6,24,0.95)] transition-all duration-300 group-hover:-translate-y-1 group-hover:rotate-0 group-hover:shadow-[0_34px_80px_-28px_rgba(255,143,171,0.45)]">
              <span className="flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-rose">
                <span aria-hidden="true">✦</span>
                {CONFIG.wishPaperHint}
              </span>
              <span className="mt-2 block font-display text-2xl leading-snug">
                {CONFIG.wishPaperLabel}
              </span>
              <span className="mt-3 block text-xs leading-relaxed text-night-deep/60">
                {CONFIG.wishPaperLines}
              </span>
              <span aria-hidden="true" className="mt-5 block space-y-2">
                <span className="block h-px w-full bg-night-deep/15" />
                <span className="block h-px w-4/5 bg-night-deep/10" />
                <span className="block h-px w-3/5 bg-night-deep/10" />
              </span>
            </span>
          </button>
        ) : null}

        {sent && paperGone ? (
          <div
            aria-live="polite"
            className="mt-10 flex max-w-sm flex-col items-center gap-3 animate-fade-up"
          >
            <p className="font-display text-2xl leading-snug text-peach">
              {CONFIG.wishSent}
            </p>
            <p className="text-[0.7rem] uppercase tracking-[0.28em] text-cream/45">
              {CONFIG.wishAutoNext}
            </p>
          </div>
        ) : null}
      </div>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[90] grid place-items-center bg-night-deep/85 px-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="wish-dialog-title"
              onClick={() => setOpen(false)}
            >
              <div
                className="glass-card w-full max-w-md rounded-3xl p-6 text-left shadow-2xl sm:p-7"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[0.32em] text-cream/40">
                      {CONFIG.wishKicker}
                    </p>
                    <h2
                      id="wish-dialog-title"
                      className="mt-2 font-display text-2xl leading-snug text-cream"
                    >
                      {CONFIG.wishDialogTitle}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label={CONFIG.wishClose}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-lg leading-none text-cream/60 transition hover:border-white/35 hover:text-cream"
                  >
                    ×
                  </button>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-cream/55">
                  {CONFIG.wishDialogText}
                </p>

                <form onSubmit={handleSubmit} className="mt-5">
                  <label htmlFor="wish-input" className="sr-only">
                    {CONFIG.wishInputLabel}
                  </label>
                  <textarea
                    id="wish-input"
                    ref={inputRef}
                    value={wish}
                    onChange={(event) => setWish(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={CONFIG.wishPlaceholder}
                    maxLength={WISH_MAX}
                    rows={4}
                    autoComplete="off"
                    className="w-full resize-none rounded-2xl border border-white/10 bg-night-deep/45 px-4 py-3 text-sm leading-relaxed text-cream placeholder:text-cream/30 focus:border-rose/60 focus:outline-none"
                  />
                  <div className="mt-1 flex items-center justify-between gap-3 text-[0.62rem] text-cream/35">
                    <span>{CONFIG.wishKeyHint}</span>
                    <span className="shrink-0 tabular-nums">
                      {wish.length}/{WISH_MAX}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={!wish.trim()}
                    className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {CONFIG.wishSend}
                    <span aria-hidden="true">↗</span>
                  </button>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
