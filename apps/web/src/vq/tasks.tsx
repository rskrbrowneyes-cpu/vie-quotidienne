import { useState } from "react";
import type { FormEvent } from "react";

import { newId, useStoredState } from "./storage";
import type { Task } from "./storage";

type Filter = "active" | "all" | "done";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "active", label: "À faire" },
  { id: "all", label: "Toutes" },
  { id: "done", label: "Terminées" },
];

export const TasksModule = () => {
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
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
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

  return (
    <section className="flex flex-col gap-4">
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
        {visible.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3"
          >
            <button
              type="button"
              aria-label={task.done ? "Marquer à faire" : "Marquer terminée"}
              onClick={() => toggle(task.id)}
              className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                task.done ? "border-accent bg-accent text-white" : "border-line"
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
              aria-label="Supprimer"
              onClick={() => remove(task.id)}
              className="text-muted active:text-red-500"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          {filter === "active"
            ? "Rien à faire. Profitez-en !"
            : "Aucune tâche ici."}
        </p>
      ) : null}
    </section>
  );
};
