import { useEffect, useRef, useState } from "react";
import { CONFIG, interpolate } from "../../config";
import { sideCannons } from "../../utils/confetti";
import { shuffle } from "../../utils/math";

const LIVES = CONFIG.gameLivesCount;
const MATCH_SHOW_MS = 620;
const WRONG_SHOW_MS = 880;
const WIN_DELAY_MS = 800;

const buildDeck = () =>
  shuffle(
    CONFIG.gameImages.flatMap((src, pair) =>
      ["a", "b"].map((copy) => ({ uid: `${pair}-${copy}`, pair, src })),
    ),
  );

export default function Game({ onNext }) {
  const [deck, setDeck] = useState(buildDeck);
  const [status, setStatus] = useState("idle");
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState(() => new Set());
  const [wrong, setWrong] = useState([]);
  const [lives, setLives] = useState(LIVES);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const timers = useRef([]);
  const nextRef = useRef(onNext);
  nextRef.current = onNext;

  useEffect(() => {
    CONFIG.gameImages.forEach((src) => {
      const image = new Image();
      image.src = `${import.meta.env.BASE_URL}${src}`;
    });
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer));
    },
    [],
  );

  const clearTimers = () => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];
  };

  const later = (callback, delay) => {
    const timer = setTimeout(callback, delay);
    timers.current.push(timer);
  };

  const start = () => {
    clearTimers();
    setDeck(buildDeck());
    setSelected([]);
    setMatched(new Set());
    setWrong([]);
    setLives(LIVES);
    setMoves(0);
    setLocked(false);
    setStatus("playing");
  };

  const flipCard = (index) => {
    if (status !== "playing" || locked) return;
    if (selected.includes(index) || matched.has(deck[index].uid)) return;

    if (selected.length === 0) {
      setSelected([index]);
      return;
    }

    const firstIndex = selected[0];
    const first = deck[firstIndex];
    const second = deck[index];

    setSelected([firstIndex, index]);
    setMoves((value) => value + 1);
    setLocked(true);

    if (first.pair === second.pair) {
      later(() => {
        const nextMatched = new Set(matched);
        nextMatched.add(first.uid);
        nextMatched.add(second.uid);
        setMatched(nextMatched);
        setSelected([]);
        setLocked(false);

        if (nextMatched.size === deck.length) {
          later(() => {
            setStatus("won");
            sideCannons({ particleCount: 70 });
          }, WIN_DELAY_MS);
        }
      }, MATCH_SHOW_MS);
      return;
    }

    const nextLives = Math.max(0, lives - 1);
    setWrong([first.uid, second.uid]);
    setLives(nextLives);

    later(() => {
      setSelected([]);
      setWrong([]);
      setLocked(false);
      if (nextLives === 0) setStatus("lost");
    }, WRONG_SHOW_MS);
  };

  const matchedPairs = matched.size / 2;
  const progress = (matchedPairs / CONFIG.gameImages.length) * 100;
  const disabled = status !== "playing" || locked;

  const finish = () => {
    nextRef.current?.({
      won: true,
      moves,
      lives,
      matchedPairs: CONFIG.gameImages.length,
    });
  };

  return (
    <section className="relative flex min-h-[100svh] w-full select-none flex-col items-center justify-center overflow-hidden px-4 py-6 sm:py-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[82vmin] w-[82vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(199,125,255,0.16),rgba(255,143,171,0.06)_45%,transparent_70%)]" />
        <div className="absolute left-1/2 top-1/2 h-[62vmin] w-[62vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/8 animate-[spin_80s_linear_infinite]" />
        <div className="absolute inset-0 grid place-items-center">
          <span className="animate-float-slow font-display text-[40vmin] leading-none text-rose opacity-[0.05]">
            ♥
          </span>
        </div>
      </div>

      <div className="relative z-10 flex w-[min(86vw,56svh,520px)] flex-col">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.55rem] uppercase tracking-[0.38em] text-cream/40">
              {CONFIG.gameKicker}
            </p>
            <h1 className="mt-1 font-display text-xl leading-tight text-cream glow-text sm:text-3xl">
              {CONFIG.gameTitle}
            </h1>
          </div>

          <div
            className="mr-14 shrink-0 rounded-2xl border border-white/10 bg-night-deep/60 px-3 py-2 text-right md:mr-0"
            aria-label={`${CONFIG.gameLives}: ${lives} / ${LIVES}`}
          >
            <p className="text-[0.5rem] uppercase tracking-[0.24em] text-cream/40">
              {CONFIG.gameLives}
            </p>
            <div className="mt-1 flex items-center justify-end gap-1.5">
              <span
                aria-hidden="true"
                className={`text-base leading-none transition-colors duration-300 ${
                  lives > 0 ? "text-rose" : "text-cream/20"
                }`}
              >
                ♥
              </span>
              <span className="text-lg font-semibold leading-none tabular-nums text-cream">
                {lives}
              </span>
            </div>
            <div
              className="ml-auto mt-1.5 grid w-14 grid-cols-10 gap-[2px]"
              aria-hidden="true"
            >
              {Array.from({ length: LIVES }, (_, index) => (
                <span
                  key={index}
                  className={`h-1 rounded-full transition-colors duration-300 ${
                    index < lives ? "bg-rose" : "bg-white/15"
                  }`}
                />
              ))}
            </div>
          </div>
        </header>

        <div className="mt-3 flex items-center gap-3">
          <span className="shrink-0 text-[0.55rem] uppercase tracking-[0.18em] text-cream/40">
            {CONFIG.gamePairs}
          </span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose via-lilac to-peach transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 text-[0.65rem] tabular-nums text-cream/55">
            {matchedPairs} / {CONFIG.gameImages.length}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-1.5 sm:mt-5 sm:gap-2.5">
          {deck.map((card, index) => {
            const isSelected = selected.includes(index);
            const isMatched = matched.has(card.uid);
            const isWrong = wrong.includes(card.uid);
            const isFlipped = isSelected || isMatched;

            const label = isMatched
              ? `${CONFIG.gameCardMatched}, foto ${card.pair + 1}`
              : isFlipped
                ? `${CONFIG.gameCardOpen}, foto ${card.pair + 1}`
                : CONFIG.gameCardHidden;

            return (
              <button
                key={card.uid}
                type="button"
                onClick={() => flipCard(index)}
                disabled={disabled || isSelected || isMatched}
                aria-label={label}
                aria-pressed={isFlipped}
                className={`memory-card aspect-[4/5] w-full touch-manipulation rounded-xl border-0 bg-transparent p-0 disabled:cursor-default sm:rounded-2xl ${
                  isFlipped ? "is-flipped" : ""
                } ${isMatched ? "is-matched" : ""} ${
                  isWrong ? "is-wrong" : ""
                }`}
              >
                <span className="memory-card-inner block h-full w-full">
                  <span className="memory-face memory-back flex flex-col items-center justify-center gap-1.5 rounded-xl border border-white/15 sm:gap-2 sm:rounded-2xl">
                    <span
                      aria-hidden="true"
                      className="grid h-7 w-7 place-items-center rounded-full border border-rose/40 bg-rose/10 text-xs text-rose sm:h-10 sm:w-10 sm:text-base"
                    >
                      ♥
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-[0.5rem] uppercase tracking-[0.3em] text-cream/35 sm:text-[0.65rem]"
                    >
                      ?
                    </span>
                  </span>

                  <span className="memory-face memory-front overflow-hidden rounded-xl border border-white/20 sm:rounded-2xl">
                    <img
                      src={`${import.meta.env.BASE_URL}${card.src}`}
                      alt=""
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night-deep/35 via-transparent to-white/10" />
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-balance text-center text-[0.68rem] leading-relaxed text-cream/40">
          {CONFIG.gameHint}
        </p>

        <p className="sr-only" aria-live="polite">
          {`${CONFIG.gameLives}: ${lives}. ${CONFIG.gamePairs}: ${matchedPairs} / ${CONFIG.gameImages.length}.`}
        </p>
      </div>

      {status !== "playing" ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-night-deep/85 px-4 py-6">
          <div className="glass-card max-h-[calc(100svh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl p-6 text-center shadow-2xl sm:p-8">
            {status === "won" ? (
              <>
                <p className="mt-3 text-[0.6rem] uppercase tracking-[0.42em] text-cream/40">
                  {CONFIG.gameKicker}
                </p>
                <h2 className="mt-2 font-display text-3xl leading-snug text-peach sm:text-4xl">
                  {CONFIG.gameWinTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-cream/70">
                  {interpolate(CONFIG.gameWinText, { moves, lives })}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={start} className="btn-ghost">
                    {CONFIG.gameRestart}
                  </button>
                  <button type="button" onClick={finish} className="btn-primary">
                    {CONFIG.gameNext}
                  </button>
                </div>
              </>
            ) : status === "lost" ? (
              <>
                <p className="mt-3 text-[0.6rem] uppercase tracking-[0.42em] text-cream/40">
                  {CONFIG.gameKicker}
                </p>
                <h2 className="mt-2 font-display text-3xl leading-snug text-lilac sm:text-4xl">
                  {CONFIG.gameLoseTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-cream/70">
                  {interpolate(CONFIG.gameLoseText, { matched: matchedPairs })}
                </p>
                <p className="mt-3 text-[0.7rem] leading-relaxed text-cream/45">
                  {CONFIG.gameLoseNote}
                </p>

                <button
                  type="button"
                  onClick={start}
                  className="btn-primary mt-6"
                >
                  {CONFIG.gameRestart}
                </button>
              </>
            ) : (
              <>
                <p className="text-[0.6rem] uppercase tracking-[0.42em] text-cream/40">
                  {CONFIG.gameKicker}
                </p>
                <h2 className="mt-2 font-display text-4xl text-cream glow-text">
                  {CONFIG.gameTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-cream/70">
                  {interpolate(CONFIG.gameText, { lives: LIVES })}
                </p>
                <button
                  type="button"
                  onClick={start}
                  className="btn-primary mt-6"
                >
                  {CONFIG.gameStart}
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
