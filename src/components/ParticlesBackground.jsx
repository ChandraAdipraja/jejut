import { useEffect, useRef } from "react";
import { getPointer } from "../utils/pointer";
import { tilt } from "../utils/tilt";
import { randomBetween } from "../utils/math";
import { getCanvasScale } from "../utils/canvas";

export default function ParticlesBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const pointer = getPointer();
    const reduced = pointer.reducedMotion;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let ratio = 1;
    let stars = [];
    let bokeh = [];
    let frame = 0;
    let running = true;
    let lastDraw = -Infinity;
    const frameMs = 1000 / 30;

    const build = () => {
      const count = width < 640 ? 28 : 46;
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: randomBetween(0.5, 1.9),
        alpha: randomBetween(0.25, 0.9),
        phase: randomBetween(0, Math.PI * 2),
        speed: randomBetween(0.4, 1.4),
        depth: randomBetween(0.25, 1),
        drift: randomBetween(0.02, 0.12),
      }));

      bokeh = Array.from({ length: width < 640 ? 2 : 3 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: randomBetween(70, 180),
        hue: Math.random() > 0.5 ? "255, 143, 171" : "199, 125, 255",
        depth: randomBetween(0.5, 1.4),
        phase: randomBetween(0, Math.PI * 2),
      }));
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      ratio = getCanvasScale(width, height, {
        maxDpr: 1.5,
        maxPixels: 2400000,
        minScale: 0.6,
      });
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      build();
    };

    const render = (time) => {
      if (!running) return;
      if (time - lastDraw < frameMs) {
        frame = requestAnimationFrame(render);
        return;
      }
      lastDraw = time;

      context.clearRect(0, 0, width, height);
      const t = time * 0.001;
      const source = pointer.finePointer || !tilt.active ? pointer : tilt;

      for (const blob of bokeh) {
        const x = blob.x + source.nx * blob.depth * 24;
        const y = blob.y + source.ny * blob.depth * 18;
        const gradient = context.createRadialGradient(x, y, 0, x, y, blob.radius);
        const pulse = 0.05 + Math.sin(t * 0.4 + blob.phase) * 0.02;
        gradient.addColorStop(0, `rgba(${blob.hue}, ${pulse + 0.05})`);
        gradient.addColorStop(1, `rgba(${blob.hue}, 0)`);
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(x, y, blob.radius, 0, Math.PI * 2);
        context.fill();
      }

      for (const star of stars) {
        const x = star.x + source.nx * star.depth * 34 + Math.sin(t * star.drift + star.phase) * 6;
        const y = star.y + source.ny * star.depth * 22;
        const twinkle = 0.45 + Math.sin(t * star.speed + star.phase) * 0.55;
        context.globalAlpha = Math.max(0, star.alpha * twinkle);
        context.fillStyle = "#fff6ef";
        context.beginPath();
        context.arc(x, y, star.radius, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      frame = requestAnimationFrame(render);
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) {
        frame = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    resize();
    if (reduced) {
      render(0);
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      frame = requestAnimationFrame(render);
      document.addEventListener("visibilitychange", onVisibility);
    }
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
