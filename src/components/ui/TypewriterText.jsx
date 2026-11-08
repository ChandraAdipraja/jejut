import { useTypewriter } from "../../hooks/useTypewriter";

export default function TypewriterText({
  lines,
  speed = 46,
  enabled = true,
  instant = false,
  onDone,
  className = "",
  lineClassName = "",
  children,
}) {
  const state = useTypewriter(lines, { speed, enabled, instant, onDone });

  return (
    <div className={className}>
      {state.typedLines.map((line, index) => (
        <p key={index} className={lineClassName}>
          <span>{line}</span>
          {enabled && !state.done && index === state.activeLine ? (
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block font-light text-rose animate-blink"
            >
              |
            </span>
          ) : null}
        </p>
      ))}
      {typeof children === "function"
        ? children({
            done: state.done,
            fast: state.fast,
            skip: state.skip,
            revealAll: state.revealAll,
          })
        : children}
    </div>
  );
}
