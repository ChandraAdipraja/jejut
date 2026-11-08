export function getCanvasScale(
  width,
  height,
  { maxDpr = 1.5, maxPixels = 2400000, minScale = 0.6 } = {},
) {
  const area = Math.max(1, width * height);
  const pixelCap = Math.sqrt(maxPixels / area);
  return Math.max(
    minScale,
    Math.min(window.devicePixelRatio || 1, maxDpr, pixelCap),
  );
}
