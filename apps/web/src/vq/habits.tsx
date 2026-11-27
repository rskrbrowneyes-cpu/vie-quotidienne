import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  currentStreak,
  lastNDays,
  newId,
  useStoredState,
  weekdayInitial,
} from "./storage";
import type { Habit } from "./storage";

export const HabitsModule = () => {
  const [habits, setHabits] = useStoredState<Habit[]>("vq.habits", []);
  const [name, setName] = useState("");
  const days = useMemo(() => lastNDays(7), []);

  const add = (event: FormEvent) => {
    event.preventDefault();
    const value = name.trim();
    if (value === "") {
      return;
    }
    setHabits((previous) => [
      ...previous,
      {
        id: newId(),
        emoji: "🎯",
        name: value,
        createdAt: new Date().toISOString(),
        checks: {},
      },
    ]);
    setName("");
  };

  const toggle = (habitId: string, day: string) => {
    setHabits((previous) =>
      previous.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              checks: { ...habit.checks, [day]: !habit.checks[day] },
            }
          : habit
      )
    );
  };

  const remove = (habitId: string) => {
    setHabits((previous) => previous.filter((habit) => habit.id !== habitId));
  };

  return (
    <section className="flex flex-col gap-4">
      <form onSubmit={add} className="flex gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nouvelle habitude…"
          className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-base outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-xl bg-accent px-4 py-3 text-base font-medium text-white active:opacity-80"
        >
          Ajouter
        </button>
      </form>

      <ul className="flex flex-col gap-3">
        {habits.map((habit) => (
          <li
            key={habit.id}
            className="rounded-2xl border border-line bg-surface p-4"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{habit.emoji}</span>
              <span className="min-w-0 flex-1 truncate text-base font-medium">
                {habit.name}
              </span>
              <span className="shrink-0 text-sm text-accent-ink">
                🔥 {currentStreak(habit.checks)}
              </span>
              <button
                type="button"
                aria-label="Supprimer"
                onClick={() => remove(habit.id)}
                className="shrink-0 text-muted active:text-red-500"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1">
              {days.map((day) => {
                const checked = Boolean(habit.checks[day]);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggle(habit.id, day)}
                    className={`flex flex-col items-center gap-1 rounded-lg py-2 ${
                      checked ? "bg-accent-soft" : "bg-raised"
                    }`}
                  >
                    <span className="text-[10px] text-muted">
                      {weekdayInitial(day)}
                    </span>
                    <span
                      className={`size-2.5 rounded-full ${
                        checked ? "bg-accent" : "bg-line"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      {habits.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          Ajoutez une première habitude à suivre chaque jour.
        </p>
      ) : null}
    </section>
  );
};
