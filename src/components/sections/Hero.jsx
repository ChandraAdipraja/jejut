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
const HANG_DROP_MS = 1150;

const HANGING_PHOTOS = [
  {
    src: "img/person8.jpeg",
    left: "3%",
    string: "16vh",
    delay: 0,
    sway: "4.8s",
    tilt: "-2.5deg",
    size: "w-20 sm:w-24",
    visibility: "",
  },
  {
    src: "img/person2.jpeg",
    left: "19%",
    string: "30vh",
    delay: 120,
    sway: "4.1s",
    tilt: "2deg",
    size: "w-16 sm:w-20",
    visibility: "hidden sm:block",
  },
  {
    src: "img/person3.jpeg",
    left: "37%",
    string: "20vh",
    delay: 240,
    sway: "5.2s",
    tilt: "-1.5deg",
    size: "w-16 sm:w-20",
    visibility: "hidden md:block",
  },
  {
    src: "img/person4.jpeg",
    right: "37%",
    string: "9vh",
    delay: 360,
    sway: "4.6s",
    tilt: "2.5deg",
    size: "w-16 sm:w-20",
    visibility: "hidden md:block",
  },
  {
    src: "img/person5.jpeg",
    right: "19%",
    string: "27vh",
    delay: 160,
    sway: "4.3s",
    tilt: "-2deg",
    size: "w-16 sm:w-20",
    visibility: "hidden sm:block",
  },
  {
    src: "img/person6.jpeg",
    right: "3%",
    string: "11vh",
    delay: 420,
    sway: "4.9s",
    tilt: "1.5deg",
    size: "w-20 sm:w-24",
    visibility: "",
  },
];

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
  const [photosReady, setPhotosReady] = useState(reduced);
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
      setPhotosReady(true);
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
      setPhotosReady(false);
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
      setPhotosReady(true);
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
  const showHangingPhotos = photosReady;

  return (
    <section className="section-shell py-16" data-hero-stage={stage}>
      {showHangingPhotos ? (
        <div
          aria-hidden="true"
          data-hero-hangs
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          {HANGING_PHOTOS.map((photo) => (
            <div
              key={photo.src}
              data-hero-hang
              className={`absolute top-0 opacity-60 sm:opacity-75 ${photo.size} ${photo.visibility}`}
              style={photo.left ? { left: photo.left } : { right: photo.right }}
            >
              <div
                className="animate-hang-drop will-change-transform motion-reduce:animate-none"
                style={{ animationDelay: `${photo.delay}ms` }}
              >
                <div
                  className="animate-hang-sway will-change-transform motion-reduce:animate-none"
                  style={{
                    animationDelay: `${photo.delay + HANG_DROP_MS}ms`,
                    animationDuration: photo.sway,
                    transformOrigin: "top center",
                    "--hang-tilt": photo.tilt,
                  }}
                >
                  <span className="mx-auto block h-1.5 w-1.5 rounded-full bg-peach/70 shadow-[0_0_10px_rgba(255,214,165,0.8)]" />
                  <span
                    className="mx-auto block w-px bg-gradient-to-b from-transparent via-cream/25 to-cream/60"
                    style={{ height: photo.string }}
                  />
                  <div className="relative mx-auto w-full">
                    <span className="absolute -top-2 left-1/2 h-3 w-8 -translate-x-1/2 rotate-2 rounded-[1px] bg-peach/50 shadow-sm" />
                    <div className="aspect-[4/5] w-full overflow-hidden rounded-[0.4rem] border-[5px] border-b-[14px] border-cream/85 bg-cream shadow-[0_16px_30px_-16px_rgba(0,0,0,0.85)]">
                      <img
                        src={`${import.meta.env.BASE_URL}${photo.src}`}
                        alt=""
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

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
              className="mx-auto mt-8 min-h-[3.5rem] w-full max-w-md text-balance font-body text-sm leading-relaxed text-cream/70 sm:text-base"
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
