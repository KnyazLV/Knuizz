// src/hooks/useSound.tsx
import { createContext, useContext, useMemo, type ReactNode } from "react";

export type SoundType = "correct" | "wrong" | "timeout" | "endgame" | "levelup";

const soundMap: Record<SoundType, HTMLAudioElement | HTMLAudioElement[]> = {
  correct: new Audio("/sounds/correct.mp3"),
  wrong: new Audio("/sounds/wrong.mp3"),
  timeout: new Audio("/sounds/timeout.mp3"),
  levelup: new Audio("/sounds/levelup"),
  endgame: [
    new Audio("/sounds/endgame.mp3"),
    new Audio("/sounds/endgame2.mp3"),
    new Audio("/sounds/endgame3.mp3"),
  ],
};

interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

interface SoundContextType {
  playSound: (sound: SoundType, options?: SoundOptions) => void;
  stopSound: (sound: SoundType) => void;
}

const SoundContext = createContext<SoundContextType>({
  playSound: () => {},
  stopSound: () => {},
});

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const playSound = (sound: SoundType, options: SoundOptions = {}) => {
    let soundToPlay: HTMLAudioElement;
    const soundEntry = soundMap[sound];

    if (Array.isArray(soundEntry)) {
      const randomIndex = Math.floor(Math.random() * soundEntry.length);
      soundToPlay = soundEntry[randomIndex];
    } else {
      soundToPlay = soundEntry;
    }

    if (soundToPlay) {
      soundToPlay.volume = options.volume ?? 1.0;
      soundToPlay.loop = options.loop ?? false;
      soundToPlay.currentTime = 0;
      soundToPlay.play().catch(console.error);
    }
  };

  const stopSound = (sound: SoundType) => {
    const soundEntry = soundMap[sound];

    if (Array.isArray(soundEntry)) {
      soundEntry.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    } else if (soundEntry) {
      soundEntry.pause();
      soundEntry.currentTime = 0;
    }
  };

  const value = useMemo(() => ({ playSound, stopSound }), []);

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
};

export const useSound = () => {
  return useContext(SoundContext);
};
