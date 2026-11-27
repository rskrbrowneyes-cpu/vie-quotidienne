import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  FREQUENCY_LABELS,
  FREQUENCY_SINGULAR,
  LEGACY_CHORE_NAMES,
  chorePeriodKey,
  dailyCompletionRate,
  defaultChores,
  formatDateTime,
  leastCompletedDaily,
  monthValidationCount,
  newId,
  useStoredState,
} from "./storage";
import type { Chore, ChoreFrequency, ChoreHistoryEntry } from "./storage";
import { SwipeToDelete } from "./swipe";

const FREQUENCIES: ChoreFrequency[] = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "spring",
  "autumn",
];

const FREQUENCY_OPTIONS: { value: ChoreFrequency; label: string }[] = [
  { value: "daily", label: "Quotidienne" },
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuelle" },
  { value: "quarterly", label: "Trimestrielle" },
  { value: "spring", label: "Printemps" },
  { value: "autumn", label: "Automne" },
];

const sectionsOf = (chores: readonly Chore[]) => {
  const sections: { title: string | undefined; chores: Chore[] }[] = [];

  for (const chore of chores) {
    const last = sections[sections.length - 1];
    if (last && last.title === chore.section) {
      last.chores.push(chore);
    } else {
      sections.push({ title: chore.section, chores: [chore] });
    }
  }

  return sections;
};

export const ChoresModule = () => {
  const [chores, setChores, choresLoaded] = useStoredState<Chore[]>(
    "vq.chores",
    [],
    defaultChores
  );
  const [history, setHistory] = useStoredState<ChoreHistoryEntry[]>(
    "vq.choresHistory",
    []
  );
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<ChoreFrequency>("daily");

  useEffect(() => {
    if (
      choresLoaded &&
      chores.length > 0 &&
      chores.every((chore) => LEGACY_CHORE_NAMES.has(chore.name))
    ) {
      setChores(defaultChores());
    }
  }, [choresLoaded, chores, setChores]);

  const rate = dailyCompletionRate(chores);
  const forgotten = leastCompletedDaily(chores);
  const monthValidations = monthValidationCount(history);

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
    const key = chorePeriodKey(chore.frequency);
    const wasChecked = Boolean(chore.done[key]);
    setChores((previous) =>
      previous.map((entry) =>
        entry.id === chore.id
          ? { ...entry, done: { ...entry.done, [key]: !entry.done[key] } }
          : entry
      )
    );
    if (!wasChecked) {
      setHistory((previous) => [
        {
          id: newId(),
          choreId: chore.id,
          choreName: chore.name,
          frequency: chore.frequency,
          period: key,
          completedAt: new Date().toISOString(),
        },
        ...previous.filter(
          (entry) => !(entry.choreId === chore.id && entry.period === key)
        ),
      ]);
    }
  };

  const removeEntry = (id: string) => {
    setHistory((previous) => previous.filter((entry) => entry.id !== id));
  };

  const clearHistory = () => {
    if (window.confirm("Supprimer tout l'historique ?")) {
      setHistory([]);
    }
  };

  const remove = (id: string) => {
    setChores((previous) => previous.filter((chore) => chore.id !== id));
  };

  const historyEntries = [...history].sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt)
  );

  return (
    <section className="flex flex-col gap-4">
      {rate !== null ? (
        <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-surface p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Routine quotidienne · 7 jours</span>
            <span className="font-semibold">{rate} %</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-raised">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${rate}%` }}
            />
          </div>
          {forgotten !== null && forgotten.count < 28 ? (
            <p className="text-xs text-muted">
              Souvent oubliée : {forgotten.name} ({forgotten.count}/28 jours)
            </p>
          ) : null}
          <p className="text-xs text-muted">
            Ce mois-ci : {monthValidations} validation
            {monthValidations > 1 ? "s" : ""}
          </p>
        </div>
      ) : null}

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
        const doneCount = groupChores.filter(
          (chore) => chore.done[chorePeriodKey(group)]
        ).length;
        const sections = sectionsOf(groupChores);

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
            {sections.map((section, sectionIndex) => {
              const sectionDone = section.chores.filter(
                (chore) => chore.done[chorePeriodKey(chore.frequency)]
              ).length;

              return (
                <div
                  key={section.title ?? `section-${sectionIndex}`}
                  className="flex flex-col gap-2"
                >
                  {section.title !== undefined ? (
                    <div className="flex items-baseline justify-between px-1">
                      <p className="text-xs font-medium text-accent-ink">
                        {section.title}
                      </p>
                      <span className="text-xs text-muted">
                        {sectionDone}/{section.chores.length}
                      </span>
                    </div>
                  ) : null}
                  <ul className="flex flex-col gap-2">
                    {section.chores.map((chore) => {
                      const checked = Boolean(
                        chore.done[chorePeriodKey(chore.frequency)]
                      );
                      return (
                        <SwipeToDelete
                          key={chore.id}
                          onDelete={() => remove(chore.id)}
                        >
                          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
                            <button
                              type="button"
                              aria-label={checked ? "Invalider" : "Valider"}
                              onClick={() => toggle(chore)}
                              className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                                checked
                                  ? "border-accent bg-accent text-white"
                                  : "border-line"
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
                          </div>
                        </SwipeToDelete>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
            {groupChores.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line px-4 py-3 text-center text-sm text-muted">
                Aucune tâche {FREQUENCY_SINGULAR[group]}.
              </p>
            ) : null}
          </div>
        );
      })}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Historique ({historyEntries.length})
          </h2>
          {historyEntries.length > 0 ? (
            <button
              type="button"
              onClick={clearHistory}
              className="text-xs font-medium text-red-500"
            >
              Tout supprimer
            </button>
          ) : null}
        </div>
        <ul className="flex flex-col gap-2">
          {historyEntries.map((entry) => (
            <SwipeToDelete
              key={entry.id}
              onDelete={() => removeEntry(entry.id)}
            >
              <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{entry.choreName}</p>
                  <p className="text-xs text-muted">
                    {FREQUENCY_SINGULAR[entry.frequency]} ·{" "}
                    {formatDateTime(entry.completedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Supprimer de l'historique"
                  onClick={() => removeEntry(entry.id)}
                  className="shrink-0 text-muted active:text-red-500"
                >
                  ✕
                </button>
              </div>
            </SwipeToDelete>
          ))}
        </ul>
        {historyEntries.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">
            Les tâches validées apparaîtront ici, sans limite de durée.
          </p>
        ) : null}
      </div>
    </section>
  );
};
