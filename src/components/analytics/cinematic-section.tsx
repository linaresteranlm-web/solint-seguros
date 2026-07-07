"use client";

import { useEffect, useState } from "react";

export function useCinematicSteps(enabled: boolean, totalSteps: number, interval = 180) {
  const [visibleSteps, setVisibleSteps] = useState(enabled ? 0 : totalSteps);

  useEffect(() => {
    if (!enabled) {
      setVisibleSteps(totalSteps);
      return;
    }

    setVisibleSteps(0);

    let current = 0;
    const timer = window.setInterval(() => {
      current += 1;
      setVisibleSteps(current);

      if (current >= totalSteps) {
        window.clearInterval(timer);
      }
    }, interval);

    return () => window.clearInterval(timer);
  }, [enabled, totalSteps, interval]);

  return visibleSteps;
}

export function CinematicSection({
  show,
  delay = 0,
  children,
}: {
  show: boolean;
  delay?: number;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), delay);

    return () => window.clearTimeout(timer);
  }, [show, delay]);

  if (!show) return null;

  return (
    <div
      className={
        visible
          ? "translate-y-0 scale-100 opacity-100 transition-all duration-700 ease-out"
          : "translate-y-8 scale-[0.985] opacity-0 transition-all duration-700 ease-out"
      }
    >
      {children}
    </div>
  );
}
