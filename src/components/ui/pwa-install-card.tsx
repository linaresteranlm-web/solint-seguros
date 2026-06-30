"use client";

import { useEffect, useState } from "react";
import { Download, MonitorDown, Smartphone, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export function PwaInstallCard() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("solint_seguros_pwa_dismissed");

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();

      if (dismissed === "true") return;

      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    function handleInstalled() {
      setInstalled(true);
      setVisible(false);
      setInstallEvent(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) return;

    await installEvent.prompt();

    const choice = await installEvent.userChoice;

    if (choice.outcome === "accepted") {
      setVisible(false);
      setInstalled(true);
    }

    setInstallEvent(null);
  }

  function handleDismiss() {
    localStorage.setItem("solint_seguros_pwa_dismissed", "true");
    setVisible(false);
  }

  if (!visible || installed) return null;

  return (
    <div className="pointer-events-none fixed bottom-28 left-4 right-4 z-[75] flex justify-center sm:left-auto sm:right-6 sm:justify-end">
      <div className="pointer-events-auto w-full max-w-md overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start gap-4 bg-gradient-to-br from-[#04224a] to-[#005eb8] p-5 text-white">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#ffb375]">
            <MonitorDown className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-100">
              SOLINT SEGUROS
            </p>
            <h3 className="mt-1 text-lg font-black">
              Instalar como aplicación
            </h3>
            <p className="mt-2 text-xs leading-5 text-blue-100">
              Instala SOLINT SEGUROS en tu PC o celular para abrirlo como app
              independiente.
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-3">
            <Smartphone className="h-5 w-5 text-[#005eb8]" />
            <p className="mt-2 text-xs font-bold text-slate-600">
              Acceso rápido desde escritorio o pantalla de inicio.
            </p>
          </div>

          <button
            onClick={handleInstall}
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#ff7415] px-5 py-4 text-sm font-black text-white transition hover:bg-[#04224a]"
          >
            <Download className="h-5 w-5" />
            Instalar app
          </button>
        </div>
      </div>
    </div>
  );
}
