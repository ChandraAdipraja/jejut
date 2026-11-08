import { useEffect, useMemo, useState } from "react";
import { CONFIG } from "../../config";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const INTRO_SPEED = 650;
const DELETE_SPEED = 500;
const TITLE_SPEED = 150;
const GREETING_SPEED = 200;
const ROLL_MS = 320;
const GACHA_MS = 2600;
const GACHA_START_MS = 55;
const GACHA_END_MS = 300;
const GACHA_HOLD_MS = 3000;

const randomGachaAge = (excluded) => {
  let value = 10 + Math.floor(Math.random() * 90);
  while (excluded.includes(String(value))) {
    value = 10 + Math.floor(Math.random() * 90);
  }
  return String(value);
};

function Cursor({ className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`ml-1 inline-block font-light text-rose animate-blink ${className}`}
    >
      |
    </span>
  );
}

export default function Hero({ onNext }) {
  const reduced = useReducedMotion();
  const targetAge = String(CONFIG.age);
  const pretendAge = String(CONFIG.heroAgePretend ?? targetAge);
  const ageDigits = useMemo(
    () =>
      targetAge.split("").map((target, index) => ({
        target,
        pretend: pretendAge[index] ?? target,
      })),
    [pretendAge, targetAge],
  );

  const [stage, setStage] = useState(reduced ? "cta" : "intro");
  const [typing, setTyping] = useState(null);
  const [intro, setIntro] = useState(reduced ? CONFIG.heroIntro : "");
  const [title, setTitle] = useState(
    reduced ? CONFIG.heroBirthdayTitle : "",
  );
  const [ageLead, setAgeLead] = useState(
    reduced ? CONFIG.heroBirthdayAgeLead : "",
  );
  const [age, setAge] = useState(reduced ? targetAge : "");
  const [gacha, setGacha] = useState(false);
  const [rolling, setRolling] = useState(reduced);
  const [greeting, setGreeting] = useState(
    reduced ? CONFIG.heroGreeting : "",
  );

  useEffect(() => {
    let cancelled = false;
    const timers = new Set();

    const wait = (ms) =>
      new Promise((resolve) => {
        const timer = window.setTimeout(() => {
          timers.delete(timer);
          resolve();
        }, ms);
        timers.add(timer);
      });

    const type = async (text, setter, speed) => {
      for (let index = 1; index <= text.length; index += 1) {
        if (cancelled) return;
        setter(text.slice(0, index));
        await wait(speed + Math.random() * 24);
        if (cancelled) return;
      }
    };

    const erase = async (text, setter, speed) => {
      for (let index = text.length; index >= 0; index -= 1) {
        if (cancelled) return;
        setter(text.slice(0, index));
        await wait(speed);
        if (cancelled) return;
      }
    };

    const runGacha = async () => {
      setGacha(true);
      let elapsed = 0;

      while (elapsed < GACHA_MS) {
        if (cancelled) return;
        setAge(randomGachaAge([pretendAge, targetAge]));
        const progress = elapsed / GACHA_MS;
        const delay =
          GACHA_START_MS +
          Math.pow(progress, 2.8) * (GACHA_END_MS - GACHA_START_MS);
        await wait(delay);
        if (cancelled) return;
        elapsed += delay;
      }

      setAge(pretendAge);
      setGacha(false);
    };

    const finish = () => {
      setStage("cta");
      setTyping(null);
      setIntro("");
      setTitle(CONFIG.heroBirthdayTitle);
      setAgeLead(CONFIG.heroBirthdayAgeLead);
      setAge(targetAge);
      setGacha(false);
      setRolling(true);
      setGreeting(CONFIG.heroGreeting);
    };

    const run = async () => {
      if (reduced) {
        finish();
        return;
      }

      setStage("intro");
      setTyping("intro");
      setIntro("");
      setTitle("");
      setAgeLead("");
      setAge("");
      setGacha(false);
      setRolling(false);
      setGreeting("");

      await type(CONFIG.heroIntro, setIntro, INTRO_SPEED);
      if (cancelled) return;
      await wait(620);
      if (cancelled) return;

      await erase(CONFIG.heroIntro, setIntro, DELETE_SPEED);
      if (cancelled) return;
      await wait(420);
      if (cancelled) return;

      setTyping(null);
      setStage("birthday");
      await wait(240);
      if (cancelled) return;

      setTyping("title");
      await type(CONFIG.heroBirthdayTitle, setTitle, TITLE_SPEED);
      if (cancelled) return;
      await wait(380);
      if (cancelled) return;

      setTyping("ageLead");
      await type(CONFIG.heroBirthdayAgeLead, setAgeLead, TITLE_SPEED);
      if (cancelled) return;
      await wait(340);
      if (cancelled) return;

      setTyping(null);
      await wait(220);
      if (cancelled) return;

      await runGacha();
      if (cancelled) return;

      await wait(GACHA_HOLD_MS);
      if (cancelled) return;

      setRolling(true);
      await wait(ROLL_MS);
      if (cancelled) return;
      setAge(targetAge);
      await wait(440);
      if (cancelled) return;

      setStage("greeting");
      setTyping("greeting");
      await type(CONFIG.heroGreeting, setGreeting, GREETING_SPEED);
      if (cancelled) return;
      await wait(340);
      if (cancelled) return;

      setTyping(null);
      await wait(280);
      if (cancelled) return;

      setStage("cta");
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, [pretendAge, reduced, targetAge]);

  const showBirthday = stage !== "intro";
  const showGreeting = stage === "greeting" || stage === "cta";
  const showButton = stage === "cta";
  const ageComplete = age.length >= targetAge.length;

  return (
    <section className="section-shell py-16" data-hero-stage={stage}>
      <div className="relative z-10 flex min-h-[24rem] w-full max-w-3xl flex-col items-center justify-center text-center sm:min-h-[27rem]">
        <div aria-hidden="true" className="w-full">
          {!showBirthday ? (
            <p className="font-body text-xl tracking-[0.16em] text-cream/70 sm:text-2xl">
              {intro}
              {typing === "intro" ? <Cursor /> : null}
            </p>
          ) : (
            <div className="flex flex-col items-center">
              <h1 className="min-h-[1.2em] text-balance font-display text-3xl leading-tight text-cream glow-text sm:text-5xl">
                {title}
                {typing === "title" ? (
                  <Cursor className="text-[0.72em]" />
                ) : null}
              </h1>

              <p className="mt-2 min-h-[1.2em] font-display text-xl leading-snug text-cream/60 sm:text-2xl">
                {ageLead}
                {typing === "ageLead" ? (
                  <Cursor className="text-[0.8em]" />
                ) : null}
              </p>

              <div
                data-hero-age={age || "pending"}
                data-hero-gacha={gacha ? "true" : "false"}
                data-hero-rolling={rolling ? "true" : "false"}
                className="mt-1 min-h-[1.15em] font-display text-6xl leading-none text-cream sm:text-8xl"
                style={{
                  filter:
                    "drop-shadow(0 0 18px rgba(255, 143, 171, 0.35)) drop-shadow(0 0 42px rgba(199, 125, 255, 0.28))",
                }}
              >
                {age ? (
                  gacha ? (
                    <span className="inline-block min-w-[1.2em] tabular-nums">
                      {age}
                    </span>
                  ) : ageComplete ? (
                    <span className="inline-flex items-baseline justify-center tabular-nums">
                      {ageDigits.map(({ target, pretend }, index) =>
                        target === pretend ? (
                          <span
                            key={index}
                            className="inline-block w-[0.58em] text-center"
                          >
                            {target}
                          </span>
                        ) : (
                          <span
                            key={index}
                            className="relative inline-block h-[1.15em] w-[0.62em] overflow-hidden text-center align-baseline"
                          >
                            <span
                              className="block leading-none will-change-transform"
                              style={{
                                transform: rolling
                                  ? "translateY(100%)"
                                  : "translateY(0)",
                                transition:
                                  "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                              }}
                            >
                              {pretend}
                            </span>
                            <span
                              className="absolute inset-x-0 top-0 block leading-none will-change-transform"
                              style={{
                                transform: rolling
                                  ? "translateY(0)"
                                  : "translateY(-100%)",
                                transition:
                                  "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                              }}
                            >
                              {target}
                            </span>
                          </span>
                        ),
                      )}
                    </span>
                  ) : (
                    <span>{age}</span>
                  )
                ) : null}
              </div>
            </div>
          )}

          {showGreeting ? (
            <p
              data-hero-greeting={greeting || "pending"}
              className="mx-auto mt-8 min-h-[3.5rem] max-w-md text-balance font-body text-sm leading-relaxed text-cream/70 sm:text-base"
            >
              {greeting}
              {typing === "greeting" ? <Cursor /> : null}
            </p>
          ) : null}
        </div>

        {showButton ? (
          <button
            type="button"
            onClick={onNext}
            data-hero-cta
            className="btn-primary animate-fade-up mt-7"
          >
            {CONFIG.heroNext}
            <span aria-hidden="true">↓</span>
          </button>
        ) : null}

        <p className="sr-only">
          {`${CONFIG.heroBirthdayTitle} ${CONFIG.heroBirthdayAgeLead} ${targetAge}. ${CONFIG.heroGreeting}`}
        </p>
      </div>
    </section>
  );
}
