"use client";

import { useEffect, useState } from "react";
import { Bot, ShieldCheck, Sparkles } from "lucide-react";

const STORAGE_KEY = "solint_welcome_seen_v39_1";

export function SolintSplashScreen() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setVisible(true);
      const timer = window.setTimeout(() => {
        setClosing(true);
        window.setTimeout(() => {
          sessionStorage.setItem(STORAGE_KEY, "true");
          setVisible(false);
        }, 450);
      }, 2200);
      return () => window.clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className={closing ? "fixed inset-0 z-[200] flex items-center justify-center bg-[#061a3a] text-white opacity-0 transition-opacity duration-500" : "fixed inset-0 z-[200] flex items-center justify-center bg-[#061a3a] text-white opacity-100 transition-opacity duration-500"}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,94,184,0.55),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,116,21,0.35),transparent_38%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_35%,rgba(255,255,255,0.04))]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur solint-glow">
          <ShieldCheck className="h-12 w-12 text-[#ffb375]" />
        </div>

        <p className="mt-8 text-sm font-black uppercase tracking-[0.35em] text-blue-100">
          SOLINT SEGUROS
        </p>

        <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
          Enterprise People Intelligence
        </h1>

        <p className="mt-5 text-base leading-8 text-blue-100 md:text-lg">
          Plataforma ejecutiva para SCTR, Vida Ley y analítica inteligente de personas.
        </p>

        <div className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3 backdrop-blur">
          <Bot className="h-5 w-5 text-[#ffb375]" />
          <span className="text-sm font-black text-blue-100">
            Powered by Matheito AI
          </span>
          <Sparkles className="h-5 w-5 text-[#ffb375]" />
        </div>

        <div className="mx-auto mt-8 h-2 max-w-md overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#ff7415] to-white solint-shimmer" />
        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-[0.25em] text-blue-100">
          Loading executive experience...
        </p>
      </div>
    </div>
  );
}
