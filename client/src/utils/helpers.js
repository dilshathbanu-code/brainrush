import confetti from 'canvas-confetti';

export const AVATAR_PRESETS = [
  { id: 'brain_blue', name: 'Cyber Neon', bg: 'from-blue-600 to-cyan-400', icon: '🧠', border: 'border-blue-500' },
  { id: 'brain_purple', name: 'Cosmic Violet', bg: 'from-purple-600 to-pink-500', icon: '⚡', border: 'border-purple-500' },
  { id: 'brain_amber', name: 'Solar Flame', bg: 'from-amber-500 to-red-500', icon: '🔥', border: 'border-amber-500' },
  { id: 'brain_emerald', name: 'Quantum Green', bg: 'from-emerald-500 to-teal-400', icon: '💎', border: 'border-emerald-500' },
  { id: 'brain_indigo', name: 'Deep Space', bg: 'from-indigo-600 to-blue-500', icon: '🚀', border: 'border-indigo-500' },
  { id: 'brain_rose', name: 'Neural Spark', bg: 'from-rose-500 to-orange-400', icon: '🌟', border: 'border-rose-500' }
];

export function getAvatarInfo(avatarId) {
  return AVATAR_PRESETS.find(a => a.id === avatarId) || AVATAR_PRESETS[0];
}

export function formatScore(num) {
  if (num === undefined || num === null) return '0';
  return Number(num).toLocaleString();
}

export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function fireConfetti() {
  try {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (e) {
    // Ignore if canvas isn't available
  }
}

export function fireBigConfetti() {
  try {
    const end = Date.now() + 2 * 1000;
    const colors = ['#3b82f6', '#60a5fa', '#8b5cf6', '#10b981', '#f59e0b'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  } catch (e) {
    // Ignore
  }
}
