import { useEffect, useRef } from "react";
import { subscribePointer } from "../utils/pointer";

export function useMousePosition() {
  const position = useRef({ x: 0, y: 0, nx: 0, ny: 0, active: false });

  useEffect(
    () =>
      subscribePointer((pointer) => {
        position.current.x = pointer.x;
        position.current.y = pointer.y;
        position.current.nx = pointer.nx;
        position.current.ny = pointer.ny;
        position.current.active = pointer.active;
      }),
    [],
  );

  return position;
}
