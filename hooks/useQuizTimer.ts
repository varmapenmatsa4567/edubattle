import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing quiz timer logic.
 * 
 * @param initialSeconds - Starting time in seconds.
 * @param onTimeUp - Callback triggered when the timer reaches zero.
 * @param isActive - Boolean to pause/resume the timer (e.g., when quiz is submitted).
 */
export const useQuizTimer = (
  initialSeconds: number | null,
  onTimeUp: () => void,
  isActive: boolean
) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(initialSeconds);

  useEffect(() => {
    if (initialSeconds !== null) {
      setTimeLeft(initialSeconds);
    }
  }, [initialSeconds]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || !isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isActive]);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      onTimeUp();
    }
  }, [timeLeft, isActive, onTimeUp]);

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }, []);

  return { timeLeft, formatTime };
};
