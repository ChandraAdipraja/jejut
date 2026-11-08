import { useEffect, useState } from "react";
import { getAudioState, subscribeAudio } from "../utils/audio";

export function useAudioState() {
  const [snapshot, setSnapshot] = useState(() => {
    const state = getAudioState();
    return {
      available: state.available,
      playing: state.playing,
      active: state.active,
    };
  });

  useEffect(
    () =>
      subscribeAudio(() => {
        const state = getAudioState();
        setSnapshot({
          available: state.available,
          playing: state.playing,
          active: state.active,
        });
      }),
    [],
  );

  return snapshot;
}
