"use client";

export type PresentationModeState = {
  enabled: boolean;
};

const EVENT_NAME = "solint:presentation-mode-change";

let state: PresentationModeState = {
  enabled: false,
};

export function getPresentationMode() {
  return state.enabled;
}

export function setPresentationMode(enabled: boolean) {
  state = { enabled };

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: state,
      })
    );
  }
}

export function togglePresentationMode() {
  setPresentationMode(!state.enabled);
}

export function subscribePresentationMode(
  callback: (state: PresentationModeState) => void
) {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<PresentationModeState>;
    callback(customEvent.detail);
  };

  window.addEventListener(EVENT_NAME, handler);

  return () => window.removeEventListener(EVENT_NAME, handler);
}

export async function requestAppFullscreen() {
  if (typeof document === "undefined") return;

  const element = document.documentElement;

  if (!document.fullscreenElement && element.requestFullscreen) {
    await element.requestFullscreen();
    return;
  }

  if (document.fullscreenElement && document.exitFullscreen) {
    await document.exitFullscreen();
  }
}
