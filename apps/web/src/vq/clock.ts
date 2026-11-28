import { useEffect, useState } from "react";

export const isNightHour = (hour: number): boolean => hour >= 20 || hour < 7;

export const useHour = (): number => {
  const [hour, setHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const id = window.setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return hour;
};

export const useIsNight = (): boolean => isNightHour(useHour());
