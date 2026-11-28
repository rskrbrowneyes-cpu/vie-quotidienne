import { useState } from "react";
import type { FormEvent } from "react";

import { newId, useStoredState } from "./storage";
import type { Task } from "./storage";
import { HouseBanner, RoomScene } from "./scene";
import type { HouseEvent } from "./scene";
import { SwipeToDelete } from "./swipe";

type Filter = "active" | "all" | "done";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "active", label: "À faire" },
  { id: "all", label: "Toutes" },
  { id: "done", label: "Terminées" },
];

type TasksModuleProps = {
  houseEvent: HouseEvent;
  onEvent: (event: HouseEvent) => void;
};

export const TasksModule = ({ houseEvent, onEvent }: TasksModuleProps) => {
  const [tasks, setTasks] = useStoredState<Task[]>("vq.tasks", []);
  const [filter, setFilter] = useState<Filter>("active");
  const [text, setText] = useState("");

  const add = (event: FormEvent) => {
    event.preventDefault();
    const value = text.trim();
    if (value === "") {
      return;
    }
    setTasks((previous) => [
      { id: newId(), text: value, done: false, createdAt: new Date().toISOString() },
      ...previous,
    ]);
    setText("");
  };

  const toggle = (id: string) => {
    const wasDone = tasks.find((task) => task.id === id)?.done ?? false;
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
    if (!wasDone) {
      onEvent({ kind: "task", ts: Date.now() });
    }
  };

  const togglePin = (id: string) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? { ...task, pinned: !task.pinned } : task
      )
    );
  };

  const remove = (id: string) => {
    setTasks((previous) => previous.filter((task) => task.id !== id));
  };

  const remaining = tasks.filter((task) => !task.done).length;
  const visible =
    filter === "all"
      ? tasks
      : tasks.filter((task) => (filter === "done" ? task.done : !task.done));
  const sorted = [...visible].sort(
    (a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false)
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="sticky top-[calc(env(safe-area-inset-top)+68px)] z-30">
        <RoomScene room="office" houseEvent={houseEvent} />
        <HouseBanner />
      </div>

      <form onSubmit={add} className="flex gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Nouvelle tâche…"
          className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-base outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-xl bg-accent px-4 py-3 text-base font-medium text-white active:opacity-80"
        >
          Ajouter
        </button>
      </form>

      <div className="flex items-center gap-1.5">
        {FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setFilter(entry.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              filter === entry.id
                ? "bg-accent-soft font-medium text-accent-ink"
                : "text-muted"
            }`}
          >
            {entry.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted">{remaining} à faire</span>
      </div>

      <ul className="flex flex-col gap-2">
        {sorted.map((task) => (
          <SwipeToDelete key={task.id} onDelete={() => remove(task.id)}>
            <div
              className={`flex items-center gap-2.5 rounded-xl border bg-surface px-3.5 py-3 ${
                task.pinned ? "border-accent" : "border-line"
              }`}
            >
              <button
                type="button"
                aria-label={task.done ? "Marquer à faire" : "Marquer terminée"}
                onClick={() => toggle(task.id)}
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                  task.done
                    ? "border-accent bg-accent text-white"
                    : "border-line"
                }`}
              >
                {task.done ? "✓" : ""}
              </button>
              <span
                className={`min-w-0 flex-1 text-base ${
                  task.done ? "text-muted line-through" : ""
                }`}
              >
                {task.text}
              </span>
              <button
                type="button"
                aria-label={task.pinned ? "Désépingler" : "Épingler"}
                onClick={() => togglePin(task.id)}
                className={`shrink-0 text-sm ${
                  task.pinned ? "text-accent" : "text-muted"
                }`}
              >
                📌
              </button>
              <button
                type="button"
                aria-label="Supprimer"
                onClick={() => remove(task.id)}
                className="shrink-0 text-muted active:text-red-500"
              >
                ✕
              </button>
            </div>
          </SwipeToDelete>
        ))}
      </ul>

      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          {filter === "active"
            ? "Rien à faire. Profitez-en !"
            : "Aucune tâche ici."}
        </p>
      ) : null}
    </section>
  );
};
