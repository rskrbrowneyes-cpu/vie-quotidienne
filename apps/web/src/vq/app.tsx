import { useEffect, useState } from "react";

import { useHour } from "./clock";
import { ModuleBoundary } from "./error-boundary";
import {
  STORAGE_KEYS,
  todayKey,
  todayLabel,
  useStoredState,
} from "./storage";
import type { Chore, ReminderSettings, Task } from "./storage";
import type { HouseEvent } from "./scene";
import { AgentModule } from "./agent";
import { BudgetModule } from "./budget";
import { ChoresModule } from "./chores";
import { HabitsModule } from "./habits";
import { InstallButton } from "./install";
import { KottonModule } from "./kotton";
import { SettingsPanel } from "./settings";
import { TABS } from "./tabs";
import type { TabId } from "./tabs";
import { TasksModule } from "./tasks";

export const App = () => {
  const [tab, setTab] = useStoredState<TabId>(STORAGE_KEYS.tab, "tasks");
  const [showSettings, setShowSettings] = useState(false);
  const [eveningDismissed, setEveningDismissed] = useStoredState<string>(
    STORAGE_KEYS.eveningDismissed,
    ""
  );
  const hour = useHour();
  const [reminder] = useStoredState<ReminderSettings>(STORAGE_KEYS.reminder, {
    enabled: false,
    time: "20:00",
  });
  const [tasks] = useStoredState<Task[]>(STORAGE_KEYS.tasks, []);
  const [chores] = useStoredState<Chore[]>(STORAGE_KEYS.chores, []);
  const [houseEvent, setHouseEvent] = useState<HouseEvent>({
    kind: "none",
    ts: 0,
  });

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
    }
  }, []);

  useEffect(() => {
    if (!reminder.enabled) {
      return;
    }

    const check = () => {
      if (!("Notification" in window) || Notification.permission !== "granted") {
        return;
      }
      const now = new Date();
      const [hours, minutes] = reminder.time.split(":").map(Number) as [
        number,
        number,
      ];
      if (now.getHours() * 60 + now.getMinutes() < hours * 60 + minutes) {
        return;
      }
      const today = todayKey();
      if (window.localStorage.getItem(STORAGE_KEYS.lastNotified) === today) {
        return;
      }
      window.localStorage.setItem(STORAGE_KEYS.lastNotified, today);
      new Notification("Vie quotidienne", {
        body: "C'est l'heure de votre routine du soir.",
      });
    };

    check();
    const id = window.setInterval(check, 30_000);
    return () => window.clearInterval(id);
  }, [reminder]);

  const pendingTasks = tasks.filter((task) => !task.done).length;
  const pendingChores = chores.filter(
    (chore) => chore.frequency === "daily" && !chore.done[todayKey()]
  ).length;
  const pending = pendingTasks + pendingChores;
  const isEvening = hour >= 20;
  const showEveningBanner =
    isEvening && pending > 0 && eveningDismissed !== todayKey();

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+1rem)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <span
                aria-hidden
                className="inline-block size-2.5 rounded-full bg-accent"
              />
              Vie quotidienne
            </h1>
            <p className="text-xs text-muted">{todayLabel()}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Réglages"
              onClick={() => setShowSettings(true)}
              className="flex size-9 items-center justify-center rounded-full border border-line text-base active:opacity-80"
            >
              ⚙
            </button>
            <InstallButton />
          </div>
        </div>
      </header>

      {showEveningBanner ? (
        <div className="mx-auto w-full max-w-md px-4 pt-3">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-raised px-4 py-3">
            <span className="text-lg" aria-hidden>
              🌙
            </span>
            <p className="min-w-0 flex-1 text-sm">
              Ce soir :{" "}
              <span className="font-semibold">
                {pending} tâche{pending > 1 ? "s" : ""}
              </span>{" "}
              en attente
            </p>
            <button
              type="button"
              aria-label="Masquer"
              onClick={() => setEveningDismissed(todayKey())}
              className="text-muted active:text-ink"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4">
        <ModuleBoundary>
          {tab === "tasks" ? (
            <TasksModule
              houseEvent={houseEvent}
              onEvent={(event) => setHouseEvent(event)}
            />
          ) : tab === "habits" ? (
            <HabitsModule
              houseEvent={houseEvent}
              onEvent={(event) => setHouseEvent(event)}
            />
          ) : tab === "chores" ? (
            <ChoresModule />
          ) : tab === "kotton" ? (
            <KottonModule />
          ) : tab === "agent" ? (
            <AgentModule />
          ) : (
            <BudgetModule
              houseEvent={houseEvent}
              onEvent={(event) => setHouseEvent(event)}
            />
          )}
        </ModuleBoundary>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-md grid-cols-6 pb-[env(safe-area-inset-bottom)]">
          {TABS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setTab(entry.id)}
              className={`flex flex-col items-center gap-0.5 py-2.5 ${
                tab === entry.id ? "text-accent" : "text-muted"
              }`}
            >
              <span className="text-lg leading-none">{entry.icon}</span>
              <span className="text-xs font-medium">{entry.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {showSettings ? <SettingsPanel onClose={() => setShowSettings(false)} /> : null}
    </div>
  );
};
