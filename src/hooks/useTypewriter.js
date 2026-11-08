import { useCallback, useEffect, useRef, useState } from "react";

const PAUSE_LONG = ".!?";
const PAUSE_SHORT = ",;:";

export function useTypewriter(
  lines,
  { speed = 46, enabled = true, instant = false, onDone } = {},
) {
  const [cursor, setCursor] = useState(() =>
    instant
      ? {
          line: Math.max(0, lines.length - 1),
          char: (lines[lines.length - 1] ?? "").length,
        }
      : { line: 0, char: 0 },
  );
  const [fast, setFast] = useState(false);
  const [done, setDone] = useState(instant);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const skip = useCallback(() => setFast(true), []);

  useEffect(() => {
    if (!instant) return;
    setCursor({
      line: Math.max(0, lines.length - 1),
      char: (lines[lines.length - 1] ?? "").length,
    });
    setDone(true);
    doneRef.current?.();
  }, [instant, lines]);

  useEffect(() => {
    if (!enabled || done) return undefined;

    const currentLine = lines[cursor.line] ?? "";

    if (cursor.char >= currentLine.length) {
      if (cursor.line >= lines.length - 1) {
        setDone(true);
        doneRef.current?.();
        return undefined;
      }

      const timeout = setTimeout(
        () => setCursor((prev) => ({ line: prev.line + 1, char: 0 })),
        fast ? 120 : 600,
      );
      return () => clearTimeout(timeout);
    }

    const character = currentLine[cursor.char];
    let delay = fast ? 8 : speed;
    if (!fast && PAUSE_LONG.includes(character)) delay *= 5;
    if (!fast && PAUSE_SHORT.includes(character)) delay *= 2.2;
    if (!fast) delay += Math.random() * 18;

    const timeout = setTimeout(
      () => setCursor((prev) => ({ ...prev, char: prev.char + 1 })),
      delay,
    );
    return () => clearTimeout(timeout);
  }, [cursor, fast, done, enabled, lines, speed]);

  const typedLines = lines.map((line, index) => {
    if (index < cursor.line) return line;
    if (index === cursor.line) return line.slice(0, cursor.char);
    return "";
  });

  const revealAll = useCallback(() => {
    setCursor({ line: Math.max(0, lines.length - 1), char: Number.MAX_SAFE_INTEGER });
    setDone(true);
    doneRef.current?.();
  }, [lines.length]);

  return {
    typedLines,
    done,
    fast,
    skip,
    revealAll,
    activeLine: cursor.line,
  };
}
