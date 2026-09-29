import React, { createContext, useContext, useState, useEffect } from 'react';
import { playSound } from '../utils/sounds';

const SoundContext = createContext();

export function SoundProvider({ children }) {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('brainrush_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('brainrush_sound', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const play = (type, param) => {
    if (soundEnabled) {
      playSound(type, true, param);
    }
  };

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, play }}>
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);
