import { useEffect, useState } from "react";

import { todayLabel, useStoredState } from "./storage";
import { BudgetModule } from "./budget";
import { HabitsModule } from "./habits";
import { InstallButton } from "./install";
import { TasksModule } from "./tasks";

type TabId = "tasks" | "habits" | "budget";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "tasks", label: "Tâches", icon: "✓" },
  { id: "habits", label: "Habitudes", icon: "◎" },
  { id: "budget", label: "Budget", icon: "€" },
];

export const App = () => {
  const [tab, setTab] = useStoredState<TabId>("vq.tab", "tasks");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
    }
  }, []);

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
            <p className="text-xs text-muted">
              {mounted ? todayLabel() : "\u00a0"}
            </p>
          </div>
          <InstallButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4">
        {tab === "tasks" ? (
          <TasksModule />
        ) : tab === "habits" ? (
          <HabitsModule />
        ) : (
          <BudgetModule />
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-md grid-cols-3 pb-[env(safe-area-inset-bottom)]">
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
    </div>
  );
};
