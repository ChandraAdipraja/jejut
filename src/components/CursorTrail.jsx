import { useEffect, useRef } from "react";
import { getPointer, subscribePointer } from "../utils/pointer";
import { randomBetween, pick } from "../utils/math";
import { getCanvasScale } from "../utils/canvas";

const COLORS = ["#ff8fab", "#c77dff", "#ffd6a5", "#fff6ef"];

export default function CursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const pointer = getPointer();
    if (pointer.reducedMotion) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    if (!context) return undefined;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let ratio = 1;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      ratio = getCanvasScale(width, height, {
        maxDpr: 1.5,
        maxPixels: 1800000,
        minScale: 0.5,
      });
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();

    const particles = [];
    const MAX = pointer.finePointer ? 48 : 24;
    let lastX = pointer.x;
    let lastY = pointer.y;
    let lastSpawn = 0;
    let frame = 0;

    const spawn = (x, y) => {
      if (particles.length >= MAX) particles.shift();
      particles.push({
        x: x + randomBetween(-6, 6),
        y: y + randomBetween(-6, 6),
        vx: randomBetween(-0.6, 0.6),
        vy: randomBetween(-0.4, 1.1),
        size: randomBetween(1.2, 3.4),
        life: 1,
        decay: randomBetween(0.012, 0.026),
        color: pick(COLORS),
        spin: randomBetween(-0.1, 0.1),
        rotation: randomBetween(0, Math.PI),
      });
    };

    const drawStar = (particle) => {
      const { x, y, size, rotation } = particle;
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.beginPath();
      for (let i = 0; i < 4; i += 1) {
        const angle = (Math.PI / 2) * i;
        context.rotate(angle);
        context.moveTo(0, 0);
        context.quadraticCurveTo(size * 0.5, size * 0.5, 0, size);
        context.quadraticCurveTo(-size * 0.5, size * 0.5, 0, 0);
      }
      context.fill();
      context.restore();
    };

    const tick = () => {
      if (!particles.length) {
        frame = 0;
        return;
      }

      context.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.012;
        particle.rotation += particle.spin;
        particle.life -= particle.decay;

        if (particle.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        context.globalAlpha = Math.max(0, particle.life) * 0.9;
        context.fillStyle = particle.color;
        drawStar(particle);
      }
      context.globalAlpha = 1;
      frame = particles.length ? requestAnimationFrame(tick) : 0;
    };

    const ensureLoop = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const unsubscribe = subscribePointer((state) => {
      const now = performance.now();
      if (now - lastSpawn < 24) return;
      const dx = state.x - lastX;
      const dy = state.y - lastY;
      if (Math.hypot(dx, dy) <= 8) return;
      spawn(state.x, state.y);
      lastX = state.x;
      lastY = state.y;
      lastSpawn = now;
      ensureLoop();
    });

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[95]"
    />
  );
}
