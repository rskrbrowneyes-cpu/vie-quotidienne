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
          className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-base outline-none placeholder:text-slate-500 focus:border-emerald-500"
        />
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-5 py-3 text-base font-medium text-white active:bg-emerald-700"
        >
          Ajouter
        </button>
      </form>

      <div className="flex gap-2">
        {FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setFilter(entry.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              filter === entry.id
                ? "bg-emerald-600/20 text-emerald-300"
                : "text-slate-400"
            }`}
          >
            {entry.label}
          </button>
        ))}
        <span className="ml-auto self-center text-sm text-slate-500">
          {remaining} à faire
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {visible.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
          >
            <button
              type="button"
              aria-label={task.done ? "Marquer à faire" : "Marquer terminée"}
              onClick={() => toggle(task.id)}
              className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                task.done
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-slate-600"
              }`}
            >
              {task.done ? "✓" : ""}
            </button>
            <span
              className={`flex-1 text-base ${
                task.done ? "text-slate-500 line-through" : ""
              }`}
            >
              {task.text}
            </span>
            <button
              type="button"
              aria-label="Supprimer"
              onClick={() => remove(task.id)}
              className="text-slate-500 active:text-rose-400"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          {filter === "active"
            ? "Rien à faire. Profitez-en !"
            : "Aucune tâche ici."}
        </p>
      ) : null}
    </section>
  );
};
