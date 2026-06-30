"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";
import {
  subscribeToasts,
  ToastItem,
  ToastVariant,
} from "@/lib/toast-store";

export function ToastViewport() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToasts((toast) => {
      setToasts((current) => [toast, ...current].slice(0, 5));

      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 5200);
    });
  }, []);

  function removeToast(id: string) {
    setToasts((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="pointer-events-none fixed right-6 top-24 z-[80] flex w-[420px] max-w-[calc(100vw-2rem)] flex-col gap-3">
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: () => void;
}) {
  const config = getConfig(toast.variant);
  const Icon = config.icon;

  return (
    <div className="pointer-events-auto overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-start gap-3 p-4">
        <div className={config.iconClass}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-[#04224a]">{toast.title}</p>
          {toast.description && (
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {toast.description}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className={config.barClass} />
    </div>
  );
}

function getConfig(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return {
        icon: CheckCircle2,
        iconClass:
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700",
        barClass: "h-1 bg-emerald-500",
      };
    case "warning":
      return {
        icon: AlertTriangle,
        iconClass:
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700",
        barClass: "h-1 bg-amber-500",
      };
    case "error":
      return {
        icon: XCircle,
        iconClass:
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700",
        barClass: "h-1 bg-red-500",
      };
    default:
      return {
        icon: Info,
        iconClass:
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#005eb8]",
        barClass: "h-1 bg-[#005eb8]",
      };
  }
}
