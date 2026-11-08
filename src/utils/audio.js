const state = {
  main: null,
  section: null,
  active: "main",
  available: true,
  playing: false,
  listeners: new Set(),
  mainVolume: 0.55,
  sectionVolume: 0.6,
  silencedByUser: false,
};

let enterToken = 0;

const emit = () => {
  for (const listener of state.listeners) listener();
};

const getActive = () => (state.active === "section" ? state.section : state.main);

const syncPlaying = () => {
  const audio = getActive();
  const playing = !!(audio && !audio.paused);
  if (playing !== state.playing) {
    state.playing = playing;
    emit();
  }
};

const wire = (audio) => {
  audio.addEventListener("play", syncPlaying);
  audio.addEventListener("pause", syncPlaying);
};

const fade = (audio, to, duration = 600) => {
  if (!audio) return;
  const token = (audio._fadeToken || 0) + 1;
  audio._fadeToken = token;
  const from = audio.volume;
  const startedAt = performance.now();

  const step = (now) => {
    if (audio._fadeToken !== token) return;
    const progress = Math.min(1, (now - startedAt) / duration);
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * progress));
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

const fadeOutAndPause = (audio, duration = 450) => {
  if (!audio || audio.paused) return;
  fade(audio, 0, duration);
  const token = audio._fadeToken;
  setTimeout(() => {
    if (audio._fadeToken === token) audio.pause();
  }, duration + 30);
};

const play = async (audio) => {
  if (!audio) return false;
  try {
    await audio.play();
    syncPlaying();
    return true;
  } catch {
    syncPlaying();
    return false;
  }
};

export const setupAudio = (src, volume = 0.5) => {
  if (state.main || typeof window === "undefined" || !src) return;
  const audio = new Audio(src);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = volume;
  audio.addEventListener("error", () => {
    state.available = false;
    emit();
  });
  wire(audio);
  state.main = audio;
  state.mainVolume = volume;
  audio.load();
};

const ensureSection = (src, volume) => {
  if (typeof window === "undefined" || !src) return null;
  if (!state.section) {
    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    wire(audio);
    state.section = audio;
  }
  state.sectionVolume = volume;
  return state.section;
};

export const enterSectionAudio = async (src, volume = 0.6) => {
  const token = ++enterToken;
  const audio = ensureSection(src, volume);
  if (!audio) return false;

  state.active = "section";
  state.silencedByUser = false;
  emit();

  if (state.main && !state.main.paused) {
    fadeOutAndPause(state.main, 550);
  }

  audio.currentTime = 0;
  audio.volume = 0;
  const started = await play(audio);

  if (token !== enterToken) {
    if (state.active !== "section") audio.pause();
    return false;
  }

  if (state.active !== "section") {
    audio.pause();
    return false;
  }

  if (started) {
    fade(audio, volume, 900);
    return true;
  }

  syncPlaying();
  return false;
};

export const restartAudio = () => {
  enterToken += 1;
  const section = state.section;
  const main = state.main;

  state.active = "main";
  state.silencedByUser = false;
  emit();

  if (section) fadeOutAndPause(section, 500);

  if (!main) {
    syncPlaying();
    return;
  }

  main.currentTime = 0;
  main.volume = 0;
  play(main).then((started) => {
    if (started && state.active === "main") {
      fade(main, state.mainVolume, 700);
    } else {
      syncPlaying();
    }
  });
};

export const playSectionMusic = async () => {
  const audio = state.section;
  if (!audio || state.active !== "section") return false;
  if (audio.volume === 0) audio.volume = 0;
  const started = await play(audio);
  if (started) {
    state.silencedByUser = false;
    fade(audio, state.sectionVolume, 600);
  }
  return started;
};

export const playMusic = async () => {
  const audio = getActive();
  if (!audio) return false;
  const started = await play(audio);
  if (!started) return false;
  if (state.active === "section") {
    state.silencedByUser = false;
    fade(audio, state.sectionVolume, 600);
  } else {
    fade(audio, state.mainVolume, 600);
  }
  return true;
};

export const pauseMusic = () => {
  const audio = getActive();
  if (!audio) return;
  if (state.active === "section") state.silencedByUser = true;
  fadeOutAndPause(audio, 300);
};

export const toggleMusic = () => {
  const audio = getActive();
  if (!audio) return;
  if (audio.paused) {
    playMusic();
  } else {
    pauseMusic();
  }
};

export const subscribeAudio = (listener) => {
  state.listeners.add(listener);
  return () => state.listeners.delete(listener);
};

export const getAudioState = () => state;
