import { useEffect, useState } from "react";

import {
  STORAGE_KEYS,
  applyImport,
  exportPayload,
  formatDateLong,
  todayKey,
  useStoredState,
} from "./storage";
import type { ReminderSettings } from "./storage";

type NotificationPermissionState = "granted" | "denied" | "default" | "unsupported";

const notificationState = (): NotificationPermissionState => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission as NotificationPermissionState;
};

export const SettingsPanel = ({ onClose }: { onClose: () => void }) => {
  const [firstOpened] = useStoredState<string>(
    STORAGE_KEYS.firstOpened,
    "",
    () => new Date().toISOString()
  );
  const [reminder, setReminder] = useStoredState<ReminderSettings>(
    "vq.reminder",
    { enabled: false, time: "20:00" }
  );
  const [permission, setPermission] = useState<NotificationPermissionState>(
    "default"
  );
  const [importError, setImportError] = useState(false);

  useEffect(() => {
    setPermission(notificationState());
  }, []);

  const download = () => {
    const blob = new Blob([exportPayload()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vie-quotidienne-${todayKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFile = async (file: File) => {
    const text = await file.text();
    if (applyImport(text)) {
      window.location.reload();
      return;
    }
    setImportError(true);
  };

  const toggleReminder = async () => {
    if (!reminder.enabled) {
      const state = notificationState();
      if (state === "default") {
        setPermission(
          (await Notification.requestPermission()) as NotificationPermissionState
        );
      } else {
        setPermission(state);
      }
    }
    setReminder((previous) => ({ ...previous, enabled: !previous.enabled }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[85dvh] w-full max-w-sm overflow-y-auto rounded-2xl bg-surface p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Réglages</h2>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="text-muted active:text-ink"
          >
            ✕
          </button>
        </div>

        <section className="mt-4 flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Données
          </h3>
          <p className="text-sm text-muted">
            Stockées uniquement sur cet appareil
            {firstOpened !== ""
              ? `, depuis le ${formatDateLong(firstOpened)}`
              : ""}
            .
          </p>
          <button
            type="button"
            onClick={download}
            className="rounded-xl bg-accent py-2.5 text-sm font-medium text-white active:opacity-80"
          >
            Exporter une sauvegarde
          </button>
          <label className="cursor-pointer rounded-xl border border-line py-2.5 text-center text-sm font-medium active:opacity-80">
            Importer une sauvegarde
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void importFile(file);
                }
                event.target.value = "";
              }}
            />
          </label>
          {importError ? (
            <p className="text-sm text-red-500">
              Fichier non reconnu : utilisez une sauvegarde de cette app.
            </p>
          ) : (
            <p className="text-xs text-muted">
              L'import remplace les données actuelles de l'appareil.
            </p>
          )}
        </section>

        <section className="mt-5 flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Rappel quotidien
          </h3>
          <label className="flex items-center justify-between text-sm">
            <span>M'alerter à heure fixe</span>
            <input
              type="checkbox"
              checked={reminder.enabled}
              onChange={() => void toggleReminder()}
              className="size-5 accent-[var(--vq-accent)]"
            />
          </label>
          {reminder.enabled ? (
            <input
              type="time"
              value={reminder.time}
              onChange={(event) =>
                setReminder((previous) => ({
                  ...previous,
                  time: event.target.value,
                }))
              }
              className="rounded-xl border border-line bg-canvas px-3 py-2 text-base outline-none focus:border-accent"
            />
          ) : null}
          <p className="text-xs text-muted">
            {permission === "granted"
              ? "Notifications autorisées. Le rappel fonctionne quand l'app est ouverte ou en arrière-plan ; pour une fiabilité maximale, gardez aussi une alarme sur votre téléphone."
              : permission === "denied"
                ? "Notifications refusées dans les réglages du navigateur : le rappel n'apparaîtra pas."
                : permission === "unsupported"
                  ? "Ce navigateur ne gère pas les notifications : ajoutez plutôt une alarme sur votre téléphone."
                  : "En activant le rappel, votre navigateur demandera l'autorisation d'envoyer des notifications."}
          </p>
        </section>
      </div>
    </div>
  );
};
