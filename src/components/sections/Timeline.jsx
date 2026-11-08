import { useEffect, useRef, useState } from "react";
import { CONFIG } from "../../config";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useAudioState } from "../../hooks/useAudioState";
import {
  enterSectionAudio,
  playSectionMusic,
} from "../../utils/audio";

const ENTRIES = CONFIG.timeline;

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

function TimelineVisual({ entry, compact = false }) {
  if (entry.image) {
    return (
      <img
        src={asset(entry.image)}
        alt={entry.title}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_50%_30%,rgba(255,143,171,0.3),rgba(199,125,255,0.16)_45%,rgba(11,11,43,0.92))]">
      <span
        aria-hidden="true"
        className={`animate-float-slow leading-none ${compact ? "text-5xl" : "text-7xl"}`}
      >
        {entry.icon ?? "📷"}
      </span>
      <span className="text-[0.58rem] uppercase tracking-[0.32em] text-cream/55">
        {CONFIG.timelineEmptyLabel}
      </span>
    </div>
  );
}

export default function Timeline({ onNext }) {
  const reduced = useReducedMotion();
  const { playing } = useAudioState();
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState(() => new Set());
  const [musicBlocked, setMusicBlocked] = useState(false);
  const entryRefs = useRef([]);
  const nextRef = useRef(onNext);
  nextRef.current = onNext;

  useEffect(() => {
    let cancelled = false;

    enterSectionAudio(
      asset(CONFIG.timelineMusic),
      CONFIG.timelineMusicVolume,
    ).then((started) => {
      if (!cancelled && !started) setMusicBlocked(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const middle = window.innerHeight * 0.52;
      let nextActive = 0;
      let bestDistance = Infinity;

      entryRefs.current.forEach((element, index) => {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - middle);
        if (distance < bestDistance) {
          bestDistance = distance;
          nextActive = index;
        }
      });

      setActive((current) => (current === nextActive ? current : nextActive));

      setSeen((current) => {
        let next = current;
        entryRefs.current.forEach((element, index) => {
          if (!element) return;
          if (element.getBoundingClientRect().top >= window.innerHeight * 0.82) {
            return;
          }
          if (!next.has(index)) {
            if (next === current) next = new Set(current);
            next.add(index);
          }
        });
        return next;
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const activeEntry = ENTRIES[active] ?? ENTRIES[0];

  return (
    <section className="relative w-full">
      <div className="mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-5 pb-16 pt-28 text-center">
        <p className="text-[0.68rem] uppercase tracking-[0.5em] text-cream/50">
          {CONFIG.timelineKicker}
        </p>
        <h1 className="mt-6 text-balance font-display text-4xl leading-tight text-cream glow-text sm:text-6xl">
          {CONFIG.timelineTitle}
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/60 sm:text-base">
          {CONFIG.timelineSubtitle}
        </p>
        <div className="mt-14 flex flex-col items-center gap-3 text-[0.58rem] uppercase tracking-[0.35em] text-cream/40">
          <span>{CONFIG.timelineScrollHint}</span>
          <span aria-hidden="true" className="animate-bob text-base text-peach">
            ↓
          </span>
        </div>
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-5 pb-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-14 md:px-8 lg:gap-20">
        <div className="hidden md:block">
            <div
              data-timeline-sticky
              className="sticky top-0 flex h-[100svh] items-center justify-center"
            >
            <div className="relative w-full max-w-md">
              <div
                aria-hidden="true"
                className="absolute -inset-8 rounded-[3rem] bg-[radial-gradient(circle_at_50%_40%,rgba(255,143,171,0.28),rgba(199,125,255,0.16)_50%,transparent_75%)] blur-2xl"
              />

              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 shadow-[0_30px_90px_rgba(3,3,20,0.6)]">
                {ENTRIES.map((entry, index) => (
                  <div
                    key={`${entry.title}-${index}`}
                    data-timeline-photo={index}
                    aria-hidden={index !== active}
                    className={`absolute inset-0 transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      index === active
                        ? "scale-100 opacity-100"
                        : "scale-105 opacity-0"
                    }`}
                  >
                    <TimelineVisual entry={entry} />
                  </div>
                ))}

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night-deep/90 via-night-deep/10 to-transparent"
                />

                <span
                  data-timeline-counter
                  className="absolute left-5 top-5 rounded-full border border-white/20 bg-night-deep/45 px-3 py-1 text-[0.6rem] uppercase tracking-[0.24em] text-cream/70 backdrop-blur"
                >
                  {String(active + 1).padStart(2, "0")} /{" "}
                  {String(ENTRIES.length).padStart(2, "0")}
                </span>

                <div className="absolute inset-x-5 bottom-5">
                  <p className="text-[0.58rem] uppercase tracking-[0.32em] text-peach/80">
                    {activeEntry?.date}
                  </p>
                  <p className="mt-2 font-display text-2xl text-cream">
                    {activeEntry?.title}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/15">
                  <div
                    className="h-full bg-gradient-to-r from-rose to-lilac transition-[width] duration-500 ease-out"
                    style={{
                      width: `${((active + 1) / Math.max(1, ENTRIES.length)) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-[0.58rem] uppercase tracking-[0.28em] text-cream/40">
                  {activeEntry?.icon ?? "✦"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative py-[8vh] md:py-[14vh]">
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-2 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/15 to-transparent"
          />

          {ENTRIES.map((entry, index) => {
            const isActive = index === active;
            const revealed = reduced || seen.has(index);

            return (
              <article
                key={`${entry.title}-${index}`}
                data-timeline-article={index}
                ref={(element) => {
                  entryRefs.current[index] = element;
                }}
                className={`relative flex min-h-[68svh] flex-col justify-center pl-8 transition-all duration-700 ease-out md:min-h-[76svh] md:pl-10 ${
                  revealed ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                } ${isActive ? "" : "md:opacity-40"}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500 ${
                    isActive
                      ? "scale-125 bg-rose shadow-[0_0_22px_rgba(255,143,171,0.85)]"
                      : "bg-white/25"
                  }`}
                />

                <div className="mb-6 overflow-hidden rounded-3xl border border-white/12 md:hidden">
                  <div className="aspect-[4/3]">
                    <TimelineVisual entry={entry} compact />
                  </div>
                </div>

                <p className="text-[0.6rem] uppercase tracking-[0.32em] text-peach/80">
                  {entry.date}
                </p>
                <h2 className="mt-3 text-balance font-display text-3xl leading-snug text-cream sm:text-4xl">
                  {entry.title}
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/65 sm:text-base">
                  {entry.text}
                </p>
              </article>
            );
          })}

          <div className="flex min-h-[55svh] flex-col items-center justify-center gap-7 pl-8 text-center md:pl-10">
            <p className="max-w-sm text-balance text-sm leading-relaxed text-cream/60 sm:text-base">
              {CONFIG.timelineOutro}
            </p>
            <button
              type="button"
              onClick={() => nextRef.current?.()}
              className="btn-primary"
            >
              {CONFIG.timelineNext}
            </button>
          </div>
        </div>
      </div>

      {musicBlocked && !playing ? (
        <button
          type="button"
          onClick={() => playSectionMusic()}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-cream/70 backdrop-blur transition hover:border-white/35 hover:text-cream"
        >
          <span aria-hidden="true" className="text-rose animate-pulse">
            ♪
          </span>
          {CONFIG.timelineMusicHint}
        </button>
      ) : null}
    </section>
  );
}
