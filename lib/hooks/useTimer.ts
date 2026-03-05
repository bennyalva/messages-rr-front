import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  /** Duration in milliseconds */
  duration: number;
  /** Callback when timer reaches zero */
  onComplete: () => void;
  /** Start automatically (default: true) */
  autoStart?: boolean;
}

interface UseTimerReturn {
  /** Remaining time in milliseconds */
  timeLeft: number;
  /** Whether timer is currently counting down */
  isRunning: boolean;
  /** Start or resume the timer */
  start: () => void;
  /** Pause the timer */
  pause: () => void;
  /** Reset to initial duration and stop */
  reset: () => void;
  /** Cancel the timer and cleanup */
  cancel: () => void;
}

/**
 * Reusable timer hook with start/pause/reset/cancel controls.
 * 
 * @example
 * const { timeLeft, isRunning } = useTimer({
 *   duration: 30000,
 *   onComplete: () => router.back(),
 * });
 */
export function useTimer({ duration, onComplete, autoStart = true }: UseTimerOptions): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep callback ref fresh without re-triggering effects
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Core interval logic
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1000;
        if (next <= 0) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          // Call onComplete on next tick to avoid state updates during render
          setTimeout(() => onCompleteRef.current(), 0);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const start = useCallback(() => {
    if (timeLeft > 0) setIsRunning(true);
  }, [timeLeft]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(duration);
  }, [duration]);

  const cancel = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { timeLeft, isRunning, start, pause, reset, cancel };
}
