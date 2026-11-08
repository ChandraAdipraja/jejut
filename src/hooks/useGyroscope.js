import { useCallback, useRef, useState } from "react";
import { resetTilt, setTilt } from "../utils/tilt";

export function useGyroscope() {
  const [enabled, setEnabled] = useState(false);
  const handlerRef = useRef(null);

  const enable = useCallback(async () => {
    if (enabled || typeof window === "undefined") return false;
    if (!("DeviceOrientationEvent" in window)) return false;
    if (window.matchMedia("(pointer: fine)").matches) return false;

    try {
      if (typeof window.DeviceOrientationEvent.requestPermission === "function") {
        const permission = await window.DeviceOrientationEvent.requestPermission();
        if (permission !== "granted") return false;
      }
    } catch {
      return false;
    }

    const handler = (event) => {
      if (event.gamma == null || event.beta == null) return;
      setTilt(event.gamma / 40, (event.beta - 45) / 40);
    };

    handlerRef.current = handler;
    window.addEventListener("deviceorientation", handler, { passive: true });
    setEnabled(true);
    return true;
  }, [enabled]);

  const disable = useCallback(() => {
    if (handlerRef.current) {
      window.removeEventListener("deviceorientation", handlerRef.current);
      handlerRef.current = null;
    }
    resetTilt();
    setEnabled(false);
  }, []);

  return { enabled, enable, disable };
}
