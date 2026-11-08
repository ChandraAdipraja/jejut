import { useAudioState } from "../hooks/useAudioState";
import { toggleMusic } from "../utils/audio";
import { CONFIG } from "../config";

export default function MusicToggle() {
  const { available, playing, active } = useAudioState();

  if (!available) return null;

  return (
    <button
      type="button"
      onClick={toggleMusic}
      data-audio-track={active}
      aria-pressed={playing}
      aria-label={playing ? CONFIG.ui.musicOn : CONFIG.ui.musicOff}
      title={playing ? CONFIG.ui.musicOn : CONFIG.ui.musicOff}
      className="fixed right-4 top-4 z-[80] grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-cream backdrop-blur-md transition hover:border-white/40 hover:bg-white/20 sm:right-6 sm:top-6"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-5 w-5 transition-transform duration-300 ${playing ? "scale-110 text-peach" : "opacity-80"}`}
        aria-hidden="true"
      >
        {playing ? (
          <>
            <path d="M9 18V6l10-2v12" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="16" cy="16" r="3" />
            <path d="M3 4c1.5 1 1.5 3 0 4M21 20c-1.5-1-1.5-3 0-4" />
          </>
        ) : (
          <>
            <path d="M9 18V6l10-2v12" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="16" cy="16" r="3" />
            <path d="M3 3l18 18" className="text-rose" />
          </>
        )}
      </svg>
    </button>
  );
}
