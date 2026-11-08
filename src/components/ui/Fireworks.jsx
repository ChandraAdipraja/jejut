import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { randomBetween } from "../../utils/math";
import { getCanvasScale } from "../../utils/canvas";

const COLORS = ["#ff8fab", "#c77dff", "#ffd6a5", "#fff6ef", "#8ecae6"];

const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export default function Fireworks({ className = "" }) {
  const canvasRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let spawnTimer = 0;
    let alive = true;
    const rockets = [];
    const particles = [];

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      dpr = getCanvasScale(width, height, {
        maxDpr: 1.5,
        maxPixels: 3000000,
        minScale: 0.6,
      });
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawnRocket = () => {
      rockets.push({
        x: randomBetween(width * 0.1, width * 0.9),
        y: height + randomBetween(4, 20),
        vy: -randomBetween(height * 0.009, height * 0.014),
        targetY: randomBetween(height * 0.12, height * 0.42),
        color: randomColor(),
        trail: [],
      });
      if (rockets.length > 6) rockets.shift();
    };

    const explode = (rocket) => {
      const count = Math.floor(randomBetween(56, 92));
      for (let index = 0; index < count; index += 1) {
        const angle = randomBetween(0, Math.PI * 2);
        const speed = randomBetween(1, 5.4);
        particles.push({
          x: rocket.x,
          y: rocket.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.35 ? rocket.color : randomColor(),
          alpha: 1,
          decay: randomBetween(0.009, 0.018),
          size: randomBetween(1.2, 2.8),
        });
      }
      if (particles.length > 560) {
        particles.splice(0, particles.length - 560);
      }
    };

    const tick = () => {
      if (!alive) return;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (let index = rockets.length - 1; index >= 0; index -= 1) {
        const rocket = rockets[index];
        rocket.trail.push({ x: rocket.x, y: rocket.y });
        if (rocket.trail.length > 6) rocket.trail.shift();

        rocket.x += randomBetween(-0.32, 0.32);
        rocket.y += rocket.vy;
        rocket.vy += 0.045;

        rocket.trail.forEach((point, pointIndex) => {
          ctx.globalAlpha = ((pointIndex + 1) / rocket.trail.length) * 0.5;
          ctx.fillStyle = rocket.color;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.globalAlpha = 0.2;
        ctx.fillStyle = rocket.color;
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff6ef";
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 1.8, 0, Math.PI * 2);
        ctx.fill();

        if (rocket.y <= rocket.targetY || rocket.vy >= -1.5) {
          explode(rocket);
          rockets.splice(index, 1);
        }
      }

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.985;
        particle.vy = particle.vy * 0.985 + 0.045;
        particle.alpha -= particle.decay;

        if (particle.alpha <= 0 || particle.y > height + 24) {
          particles.splice(index, 1);
          continue;
        }

        ctx.globalAlpha = Math.max(0, particle.alpha);
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(tick);
    };

    const schedule = () => {
      spawnRocket();
      spawnTimer = setTimeout(schedule, randomBetween(440, 780));
    };

    resize();
    window.addEventListener("resize", resize);
    spawnTimer = setTimeout(() => {
      spawnRocket();
      spawnRocket();
      spawnRocket();
      schedule();
    }, 160);
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(spawnTimer);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-fireworks
      className={`pointer-events-none ${className}`}
    />
  );
}
