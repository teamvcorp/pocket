"use client";
import { useEffect, useRef, useState } from "react";

const DISMISS_KEY = "pj-install-dismissed";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

function isDismissed() {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    return Date.now() - Number(ts) < SEVEN_DAYS;
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {}
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export function InstallPrompt() {
  const [androidPrompt, setAndroidPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Already installed as standalone
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (isDismissed()) return;

    // Android — capture beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setAndroidPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari detection (no beforeinstallprompt)
    const isIos =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window.navigator as { standalone?: boolean }).standalone;
    if (isIos) {
      timerRef.current = setTimeout(() => {
        setShowIos(true);
        setVisible(true);
      }, 2500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleAndroidInstall = async () => {
    if (!androidPrompt) return;
    await androidPrompt.prompt();
    handleDismiss();
  };

  const handleDismiss = () => {
    dismiss();
    setVisible(false);
  };

  if (!visible) return null;

  // Android banner — slides from top
  if (androidPrompt) {
    return (
      <div
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between gap-3 px-4 py-3 border-b border-olive-200 shadow-md"
        style={{ background: "#243018", color: "#e0ecbe" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">✝</span>
          <div>
            <p className="text-sm font-semibold">Add to Home Screen</p>
            <p className="text-xs opacity-70">Get quick access to Pocket Jesus</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAndroidInstall}
            className="text-xs bg-olive-500 hover:bg-olive-400 text-white font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            Install
          </button>
          <button onClick={handleDismiss} className="text-xs opacity-50 hover:opacity-100 px-1">
            ✕
          </button>
        </div>
      </div>
    );
  }

  // iOS instructions — slides from bottom
  if (showIos) {
    return (
      <div
        className="fixed bottom-0 inset-x-0 z-50 rounded-t-2xl border-t border-olive-200 shadow-xl p-5"
        style={{ background: "#243018", color: "#e0ecbe" }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-sm">Add to Home Screen</p>
          <button onClick={handleDismiss} className="text-xs opacity-50 hover:opacity-100">
            ✕
          </button>
        </div>
        <ol className="space-y-2 text-sm opacity-80">
          <li>1. Tap the <strong>Share</strong> button <span className="font-mono">⎙</span> in Safari</li>
          <li>2. Scroll and tap <strong>Add to Home Screen</strong></li>
          <li>3. Tap <strong>Add</strong> to confirm</li>
        </ol>
      </div>
    );
  }

  return null;
}
