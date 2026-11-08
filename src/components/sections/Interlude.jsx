import { useEffect, useRef, useState } from "react";
import { CONFIG, interpolate } from "../../config";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const LINES = CONFIG.interludeLines.map((line) => interpolate(line));
const TYPE_MS = CONFIG.interludeSpeed;
const HOLD_MS = CONFIG.interludeHold;
const FADE_MS = 650;
const COUNT_MS = 800;

export default function Interlude({ onDone }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(reduced ? LINES[0] : "");
  const [leaving, setLeaving] = useState(false);
  const [count, setCount] = useState(null);
  const doneRef = useRef(onDone);
  const finishedRef = useRef(false);
  doneRef.current = onDone;

  useEffect(() => {
    if (count !== null || leaving) return undefined;
    const line = LINES[index] ?? "";
    let timer;
    let char = 0;
    let cancelled = false;

    if (reduced) {
      setTyped(line);
      timer = setTimeout(() => {
        if (index < LINES.length - 1) {
          setLeaving(true);
        } else {
          setCount(3);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }

    setTyped("");

    const typeNext = () => {
      if (cancelled) return;
      char += 1;
      setTyped(line.slice(0, char));

      if (char < line.length) {
        const character = line[char - 1];
        let delay = TYPE_MS + Math.random() * 22;
        if (".!?".includes(character)) delay += 260;
        else if (",;:".includes(character)) delay += 110;
        timer = setTimeout(typeNext, delay);
        return;
      }

      timer = setTimeout(() => {
        if (index < LINES.length - 1) {
          setLeaving(true);
        } else {
          setCount(3);
        }
      }, HOLD_MS);
    };

    timer = setTimeout(typeNext, 520);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [count, index, leaving, reduced]);

  useEffect(() => {
    if (!leaving) return undefined;
    const timer = setTimeout(() => {
      setIndex((current) => Math.min(current + 1, LINES.length - 1));
      setLeaving(false);
    }, FADE_MS);
    return () => clearTimeout(timer);
  }, [leaving]);

  useEffect(() => {
    if (count === null) return undefined;
    const timer = setTimeout(() => {
      if (count === 1) {
        if (!finishedRef.current) {
          finishedRef.current = true;
          doneRef.current?.();
        }
        return;
      }
      setCount(count - 1);
    }, COUNT_MS);
    return () => clearTimeout(timer);
  }, [count]);

  const skip = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    doneRef.current?.();
  };

  const counting = count !== null;
  const showCursor = !counting && !leaving && !reduced;

  return (
    <section className="section-shell">
      <div className="flex w-full max-w-3xl flex-col items-center text-center">
        <div className="flex min-h-[15rem] w-full items-center justify-center">
          {counting ? (
            <span
              key={count}
              className="animate-icon-in font-display text-[7rem] leading-none text-rose glow-text sm:text-[9rem]"
            >
              {count}
            </span>
          ) : (
            <p
              aria-hidden="true"
              data-interlude-typed
              className={`text-balance px-2 font-display text-2xl leading-snug text-cream glow-text transition-all duration-500 sm:text-4xl md:text-5xl ${
                leaving
                  ? "-translate-y-2 opacity-0 blur-sm"
                  : "translate-y-0 opacity-100 blur-0"
              }`}
            >
              {typed}
              {showCursor ? (
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block font-light text-rose animate-blink"
                >
                  |
                </span>
              ) : null}
            </p>
          )}
        </div>

        <p className="sr-only" aria-live="polite">
          {counting ? count : LINES[index]}
        </p>

      </div>

    </section>
  );
}
