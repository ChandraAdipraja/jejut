export const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, value));

export const lerp = (current, target, amount) =>
  current + (target - current) * amount;

export const randomBetween = (min, max) => Math.random() * (max - min) + min;

export const pick = (items) => items[Math.floor(Math.random() * items.length)];

export const shuffle = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
};
