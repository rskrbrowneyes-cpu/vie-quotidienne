import { useEffect, useState } from "react";

import { todayLabel, useStoredState } from "./storage";
import { BudgetModule } from "./budget";
import { HabitsModule } from "./habits";
import { TasksModule } from "./tasks";

type TabId = "tasks" | "habits" | "budget";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "tasks", label: "Tâches", icon: "✓" },
  { id: "habits", label: "Habitudes", icon: "◎" },
  { id: "budget", label: "Budget", icon: "€" },
];

const TAB_STYLES: Record<TabId, string> = {
  tasks: "text-emerald-400",
  habits: "text-violet-400",
  budget: "text-sky-400",
};

export const App = () => {
  const [tab, setTab] = useStoredState<TabId>("vq.tab", "tasks");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 text-slate-100">
      <header className="px-5 pb-2 pt-6">
        <h1 className="text-xl font-semibold tracking-tight">Vie quotidienne</h1>
        <p className="text-sm text-slate-400">
          {mounted ? todayLabel() : "\u00a0"}
        </p>
      </header>
      <main className="flex-1 px-4 pb-28 pt-2">
        {tab === "tasks" ? (
          <TasksModule />
        ) : tab === "habits" ? (
          <HabitsModule />
        ) : (
          <BudgetModule />
        )}
      </main>
      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-3 pb-[env(safe-area-inset-bottom)]">
          {TABS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setTab(entry.id)}
              className={`flex flex-col items-center gap-0.5 py-2.5 ${
                tab === entry.id
                  ? TAB_STYLES[entry.id]
                  : "text-slate-500"
              }`}
            >
              <span className="text-lg leading-none">{entry.icon}</span>
              <span className="text-xs">{entry.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};
