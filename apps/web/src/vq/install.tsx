import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const platformHint = (): string => {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return "Sur iPhone : touchez le bouton Partager en bas de Safari, puis « Sur l'écran d'accueil ».";
  }
  if (/Android/i.test(ua)) {
    return "Sur Android : ouvrez le menu ⋮ du navigateur, puis « Installer l'application » ou « Ajouter à l'écran d'accueil ».";
  }
  return "Dans votre navigateur, utilisez le menu puis « Installer l'application » ou « Ajouter à l'écran d'accueil ».";
};

export const InstallButton = () => {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [standalone, setStandalone] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const update = () =>
      setStandalone(
        media.matches ||
          (navigator as Navigator & { standalone?: boolean }).standalone === true
      );
    update();

    const handler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const installed = () => setPromptEvent(null);

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  if (standalone) {
    return null;
  }

  const install = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") {
        setPromptEvent(null);
      }
      return;
    }
    setShowHelp(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void install()}
        className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-white active:opacity-80"
      >
        <span aria-hidden>⬇</span> Installer
      </button>

      {showHelp ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-surface p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-base font-semibold">
              Installer sur votre téléphone
            </h2>
            <p className="mt-2 text-sm text-muted">{platformHint()}</p>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full rounded-xl bg-raised py-2.5 text-sm font-medium active:opacity-80"
            >
              Fermer
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};
