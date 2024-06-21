"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface TimeState {
  hours: number;
  minutes: number;
  seconds: number;
}

export function useStopwatch() {
  const [time, setTime] = useState<TimeState>({ seconds: 0, minutes: 0, hours: 0 });
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<any>(null);

  const tick = useCallback(() => {
    setTime((prevTime) => {
      let hours = prevTime.hours;
      let minutes = prevTime.minutes;
      let seconds = prevTime.seconds;

      seconds += 1;

      if (seconds >= 60) {
        minutes += 1;
        seconds = 0;
      }

      if (minutes >= 60) {
        hours += 1;
        minutes = 0;
      }

      return { hours, minutes, seconds };
    });
  }, []);

  const clear = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setTime({ seconds: 0, minutes: 0, hours: 0 });
  }, []);

  const start = useCallback(() => {
    setIsActive(true);
    intervalRef.current = setInterval(tick, 1000);
  }, [tick]);

  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  return {
    ...time,
    isActive,
    clear,
    start,
    setIsActive
  };
}
