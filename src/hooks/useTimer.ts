import { useCallback, useEffect, useRef, useState } from 'react';

export function useTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const frameRef = useRef<number>(0);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    return () => {
      if (delayRef.current) clearTimeout(delayRef.current);
    };
  }, []);

  const start = useCallback(() => {
    if (!running && !waiting) {
      startTimeRef.current = performance.now();
      setRunning(true);
    }
  }, [running, waiting]);

  const startDelayed = useCallback(
    (delayMs = 1000) => {
      if (running || waiting) return;
      setWaiting(true);
      delayRef.current = setTimeout(() => {
        delayRef.current = null;
        setWaiting(false);
        startTimeRef.current = performance.now();
        setRunning(true);
      }, delayMs);
    },
    [running, waiting],
  );

  const pause = useCallback(() => {
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
      setWaiting(false);
    }
    if (running && startTimeRef.current !== null) {
      accumulatedRef.current += performance.now() - startTimeRef.current;
      startTimeRef.current = null;
      setRunning(false);
    }
  }, [running]);

  const reset = useCallback(() => {
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
    cancelAnimationFrame(frameRef.current);
    startTimeRef.current = null;
    accumulatedRef.current = 0;
    setElapsed(0);
    setRunning(false);
    setWaiting(false);
  }, []);

  const active = running || waiting;

  return { elapsed, running, waiting, active, start, startDelayed, pause, reset };
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
