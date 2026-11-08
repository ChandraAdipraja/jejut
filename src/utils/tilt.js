export const tilt = { x: 0, y: 0, active: false };

export const setTilt = (x, y) => {
  tilt.x = Math.max(-1, Math.min(1, x));
  tilt.y = Math.max(-1, Math.min(1, y));
  tilt.active = true;
};

export const resetTilt = () => {
  tilt.x = 0;
  tilt.y = 0;
  tilt.active = false;
};
