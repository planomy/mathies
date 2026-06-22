import { useCallback, useEffect, useRef, useState } from 'react';

export function useTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const frameRef = useRef<number>(0);

  const tick = useCallback(() => {
    if (startTimeRef.current !== null) {
      setElapsed(accumulatedRef.current + (performance.now() - startTimeRef.current));
    }
    frameRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (running) {
      frameRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(frameRef.current);
  }, [running, tick]);

  const start = useCallback(() => {
    if (!running) {
      startTimeRef.current = performance.now();
      setRunning(true);
    }
  }, [running]);

  const pause = useCallback(() => {
    if (running && startTimeRef.current !== null) {
      accumulatedRef.current += performance.now() - startTimeRef.current;
      startTimeRef.current = null;
      setRunning(false);
    }
  }, [running]);

  const reset = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    startTimeRef.current = null;
    accumulatedRef.current = 0;
    setElapsed(0);
    setRunning(false);
  }, []);

  return { elapsed, running, active: running, start, pause, reset };
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

export function splitTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  return {
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    centiseconds: String(centiseconds).padStart(2, '0'),
  };
}
