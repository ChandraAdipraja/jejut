import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { CONFIG } from "./config";
import { playMusic, restartAudio, setupAudio } from "./utils/audio";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useGyroscope } from "./hooks/useGyroscope";

import ParticlesBackground from "./components/ParticlesBackground";
import CustomCursor from "./components/CustomCursor";
import CursorTrail from "./components/CursorTrail";
import MusicToggle from "./components/MusicToggle";

import Splash from "./components/sections/Splash";
import Interlude from "./components/sections/Interlude";
import Timeline from "./components/sections/Timeline";
import Game from "./components/sections/Game";
import Hero from "./components/sections/Hero";
import Wish from "./components/sections/Wish";
import Message from "./components/sections/Message";
import Finale from "./components/sections/Finale";

const STAGES = [
  "splash",
  "interlude",
  "game",
  "timeline",
  "hero",
  "wish",
  "message",
  "finale",
];

export default function App() {
  const [stage, setStage] = useState("splash");
  const stageRef = useRef(null);
  const flashRef = useRef(null);
  const transitioning = useRef(false);
  const enterFrom = useRef(null);
  const reduced = useReducedMotion();
  const { enable: enableGyro } = useGyroscope();

  useEffect(() => {
    setupAudio(`${import.meta.env.BASE_URL}${CONFIG.music}`, CONFIG.musicVolume);
    playMusic();
  }, []);

  useEffect(() => {
    const onFirstTap = (event) => {
      enableGyro();
      if (!event.target.closest?.("[data-audio-track]")) playMusic();
    };
    window.addEventListener("pointerdown", onFirstTap, { once: true });
    return () => window.removeEventListener("pointerdown", onFirstTap);
  }, [enableGyro]);

  const goTo = useCallback(
    (next, { flash = false, transition = null } = {}) => {
      if (!STAGES.includes(next) || next === stage || transitioning.current) return;
      const node = stageRef.current;
      if (!node || reduced) {
        setStage(next);
        window.scrollTo(0, 0);
        return;
      }

      if (transition === "slideUp") {
        transitioning.current = true;
        enterFrom.current = "bottom";
        gsap.to(node, {
          y: "-100vh",
          autoAlpha: 0.85,
          duration: 0.9,
          ease: "power3.inOut",
          onComplete: () => {
            setStage(next);
            window.scrollTo(0, 0);
          },
        });
        return;
      }

      if (flash && flashRef.current) {
        transitioning.current = true;
        gsap.to(node, { autoAlpha: 0, duration: 0.35, ease: "power2.in" });
        gsap
          .timeline()
          .to(flashRef.current, {
            autoAlpha: 0.95,
            duration: 0.35,
            ease: "power2.in",
          })
          .call(() => {
            setStage(next);
            window.scrollTo(0, 0);
          })
          .to(flashRef.current, {
            autoAlpha: 0,
            duration: 0.7,
            ease: "power2.out",
          });
        return;
      }

      transitioning.current = true;
      gsap.to(node, {
        autoAlpha: 0,
        scale: 0.965,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          setStage(next);
          window.scrollTo(0, 0);
        },
      });
    },
    [reduced, stage],
  );

  useGSAP(
    () => {
      if (!stageRef.current) return;
      const fromBottom = enterFrom.current === "bottom";
      enterFrom.current = null;
      gsap.fromTo(
        stageRef.current,
        {
          autoAlpha: 0,
          y: fromBottom ? "70vh" : 12,
          scale: reduced ? 1 : 1.02,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: reduced ? 0.01 : 0.75,
          ease: "power3.out",
          clearProps: "transform",
          onComplete: () => {
            transitioning.current = false;
          },
        },
      );
    },
    { dependencies: [stage], scope: stageRef },
  );

  const restart = useCallback(() => {
    if (transitioning.current) return;
    restartAudio();
    setStage("splash");
    window.scrollTo(0, 0);
  }, []);

  const playGame = useCallback(() => {
    goTo("timeline", { flash: true });
  }, [goTo]);

  const stages = {
    splash: <Splash onDone={() => goTo("interlude", { transition: "slideUp" })} />,
    interlude: <Interlude onDone={() => goTo("game", { flash: true })} />,
    game: <Game onNext={playGame} />,
    timeline: <Timeline onNext={() => goTo("hero", { flash: true })} />,
    hero: <Hero onNext={() => goTo("wish")} />,
    wish: <Wish onNext={() => goTo("message")} />,
    message: <Message onNext={() => goTo("finale")} />,
    finale: <Finale onRestart={restart} />,
  };

  return (
    <main className="relative min-h-[100svh] w-full overflow-x-clip bg-night text-cream">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(120%_90%_at_50%_-10%,#1b1445_0%,#0b0b2b_45%,#060618_100%)]"
      />
      <ParticlesBackground />
      <MusicToggle />
      <CustomCursor />
      <CursorTrail />

      <div
        key={stage}
        ref={stageRef}
        data-stage={stage}
        className="relative z-10 min-h-[100svh] w-full"
      >
        {stages[stage]}
      </div>

      <div
        ref={flashRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[70] bg-[radial-gradient(circle_at_center,#fff6ef_0%,#ffd6a5_45%,#ff8fab_100%)] opacity-0"
      />
    </main>
  );
}
