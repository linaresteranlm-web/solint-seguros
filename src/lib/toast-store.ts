"use client";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type Listener = (toast: ToastItem) => void;

const listeners = new Set<Listener>();

export function subscribeToasts(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function showToast(params: {
  title: string;
  description?: string;
  variant?: ToastVariant;
}) {
  const toast: ToastItem = {
    id: crypto.randomUUID(),
    title: params.title,
    description: params.description,
    variant: params.variant ?? "info",
  };

  listeners.forEach((listener) => listener(toast));
}
