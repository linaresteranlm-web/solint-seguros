"use client";

import { useEffect, useMemo, useState } from "react";

function extractNumber(value: string | number) {
  if (typeof value === "number") return value;

  const clean = String(value).replace(/[^\d.-]/g, "");
  const parsed = Number(clean);

  return Number.isFinite(parsed) ? parsed : null;
}

export function AnimatedCounter({
  value,
  duration = 900,
  decimals,
  suffix = "",
}: {
  value: number | string;
  duration?: number;
  decimals?: number;
  suffix?: string;
}) {
  const numericValue = useMemo(() => extractNumber(value), [value]);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (numericValue === null) return;

    let frame = 0;
    let startTime: number | null = null;
    let animationFrame = 0;

    function animate(timestamp: number) {
      if (startTime === null) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      frame = numericValue * eased;
      setDisplay(frame);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    }

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [numericValue, duration]);

  if (numericValue === null) {
    return <>{value}</>;
  }

  const resolvedDecimals =
    decimals ?? (Number.isInteger(numericValue) ? 0 : 2);

  return (
    <>
      {display.toLocaleString("es-PE", {
        minimumFractionDigits: resolvedDecimals,
        maximumFractionDigits: resolvedDecimals,
      })}
      {suffix}
    </>
  );
}

export function MotionReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), delay);

    return () => window.clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`${className} transition-all duration-500 ease-out ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-4 scale-[0.98] opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

export function MotionGrid({
  children,
  className = "",
  delayStep = 90,
}: {
  children: React.ReactNode[];
  className?: string;
  delayStep?: number;
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <MotionReveal key={index} delay={index * delayStep}>
          {child}
        </MotionReveal>
      ))}
    </div>
  );
}

export function ExecutivePulse({
  children,
  level = "good",
}: {
  children: React.ReactNode;
  level?: "excellent" | "good" | "warning" | "critical";
}) {
  const color =
    level === "excellent"
      ? "shadow-emerald-400/30"
      : level === "good"
        ? "shadow-blue-400/30"
        : level === "warning"
          ? "shadow-amber-400/30"
          : "shadow-red-400/30";

  return (
    <div className={`animate-[solintPulse_2.6s_ease-in-out_infinite] rounded-full shadow-2xl ${color}`}>
      {children}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-200" />
      <div className="mt-5 h-3 w-24 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-3 h-8 w-32 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-4 h-3 w-full animate-pulse rounded-full bg-slate-200" />
      <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-slate-200" />
    </div>
  );
}
