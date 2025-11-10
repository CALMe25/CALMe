import React, { useEffect, useRef } from "react";
import type { AppInterface } from "../appsContextApi";

interface AppLauncherProps {
  chosenApp: AppInterface | undefined;
  onClose: () => void;
}

export default function AppLauncher({ chosenApp, onClose }: AppLauncherProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusableElements =
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
        if (focusableElements.length === 0) return;
        if (focusableElements.length === 1) {
          event.preventDefault();
          focusableElements[0].focus();
          return;
        }

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [onClose]);

  const renderApp = () => {
    if (!chosenApp) {
      return (
        <div className="text-white text-center">
          <p>No app selected</p>
        </div>
      );
    }

    if (!React.isValidElement(chosenApp.main)) {
      return (
        <div className="text-white text-center">
          <p>Unable to launch app.</p>
        </div>
      );
    }

    return React.cloneElement(chosenApp.main, { onGameEnd: onClose });
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${chosenApp?.label ?? "Activity"} dialog`}
      className="flex h-full w-full items-center justify-center bg-slate-950/70 px-3 py-4 backdrop-blur-sm sm:px-6"
      style={{
        paddingTop: `calc(env(safe-area-inset-top, 0px) + 1rem)`,
        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 1rem)`,
      }}
    >
      <div className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-gray-900/90 text-white shadow-[0_25px_80px_rgba(15,23,42,0.75)]">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
              Activity
            </span>
            <p className="text-base font-semibold text-white">
              {chosenApp?.label ?? "Calming exercise"}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full w-full flex-col overflow-auto px-3 py-4 sm:px-5 sm:py-6">
            <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-card/90 p-2 sm:p-4">
              {renderApp()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
