"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch {
        // Se omite error silenciosamente para no afectar el ERP.
      }
    };

    registerServiceWorker();
  }, []);

  return null;
}
