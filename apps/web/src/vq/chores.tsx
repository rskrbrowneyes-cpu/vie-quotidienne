import { useState } from "react";
import type { FormEvent } from "react";

import {
  FREQUENCY_LABELS,
  defaultChores,
  monthKeyOf,
  newId,
  todayKey,
  useStoredState,
  weekKeyOf,
} from "./storage";
import type { Chore, ChoreFrequency } from "./storage";

const FREQUENCIES: ChoreFrequency[] = ["daily", "weekly", "monthly"];

const FREQUENCY_OPTIONS: { value: ChoreFrequency; label: string }[] = [
  { value: "daily", label: "Quotidienne" },
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuelle" },
];

const periodKey = (frequency: ChoreFrequency): string =>
  frequency === "daily"
    ? todayKey()
    : frequency === "weekly"
      ? weekKeyOf()
      : monthKeyOf(todayKey());

export const ChoresModule = () => {
  const [chores, setChores] = useStoredState<Chore[]>(
    "vq.chores",
    [],
    defaultChores
  );
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<ChoreFrequency>("daily");

  const add = (event: FormEvent) => {
    event.preventDefault();
    const value = name.trim();
    if (value === "") {
      return;
    }
    setChores((previous) => [
      ...previous,
      { id: newId(), name: value, frequency, done: {} },
    ]);
    setName("");
  };

  const toggle = (chore: Chore) => {
    const key = periodKey(chore.frequency);
    setChores((previous) =>
      previous.map((entry) =>
        entry.id === chore.id
          ? { ...entry, done: { ...entry.done, [key]: !entry.done[key] } }
          : entry
      )
    );
  };

  const remove = (id: string) => {
    setChores((previous) => previous.filter((chore) => chore.id !== id));
  };

  return (
    <section className="flex flex-col gap-4">
      <form onSubmit={add} className="grid grid-cols-2 gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nouvelle tâche ménagère…"
          className="col-span-2 rounded-xl border border-line bg-surface px-4 py-3 text-base outline-none placeholder:text-muted focus:border-accent"
        />
        <select
          value={frequency}
          onChange={(event) => setFrequency(event.target.value as ChoreFrequency)}
          className="rounded-xl border border-line bg-surface px-3 py-3 text-base outline-none focus:border-accent"
        >
          {FREQUENCY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-accent py-3 text-base font-medium text-white active:opacity-80"
        >
          Ajouter
        </button>
      </form>

      {FREQUENCIES.map((group) => {
        const groupChores = chores.filter((chore) => chore.frequency === group);
        const doneCount = groupChores.filter((chore) => chore.done[periodKey(group)]).length;

        return (
          <div key={group} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between px-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {FREQUENCY_LABELS[group]}
              </h2>
              <span className="text-xs text-muted">
                {doneCount}/{groupChores.length}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {groupChores.map((chore) => {
                const checked = Boolean(chore.done[periodKey(chore.frequency)]);
                return (
                  <li
                    key={chore.id}
                    className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3"
                  >
                    <button
                      type="button"
                      aria-label={checked ? "Invalider" : "Valider"}
                      onClick={() => toggle(chore)}
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                        checked ? "border-accent bg-accent text-white" : "border-line"
                      }`}
                    >
                      {checked ? "✓" : ""}
                    </button>
                    <span
                      className={`min-w-0 flex-1 text-base ${
                        checked ? "text-muted line-through" : ""
                      }`}
                    >
                      {chore.name}
                    </span>
                    <button
                      type="button"
                      aria-label="Supprimer"
                      onClick={() => remove(chore.id)}
                      className="shrink-0 text-muted active:text-red-500"
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
              {groupChores.length === 0 ? (
                <li className="rounded-xl border border-dashed border-line px-4 py-3 text-center text-sm text-muted">
                  Aucune tâche {FREQUENCY_LABELS[group].toLowerCase()}.
                </li>
              ) : null}
            </ul>
          </div>
        );
      })}
    </section>
  );
};
