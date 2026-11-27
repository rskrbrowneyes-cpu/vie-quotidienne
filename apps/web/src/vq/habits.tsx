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
          className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-base outline-none placeholder:text-slate-500 focus:border-violet-500"
        />
        <button
          type="submit"
          className="rounded-xl bg-violet-600 px-5 py-3 text-base font-medium text-white active:bg-violet-700"
        >
          Ajouter
        </button>
      </form>

      <ul className="flex flex-col gap-3">
        {habits.map((habit) => (
          <li
            key={habit.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{habit.emoji}</span>
              <span className="flex-1 text-base font-medium">{habit.name}</span>
              <span className="text-sm text-amber-400">
                🔥 {currentStreak(habit.checks)}
              </span>
              <button
                type="button"
                aria-label="Supprimer"
                onClick={() => remove(habit.id)}
                className="text-slate-500 active:text-rose-400"
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
                      checked ? "bg-violet-600/30" : "bg-slate-800/60"
                    }`}
                  >
                    <span className="text-[10px] text-slate-400">
                      {weekdayInitial(day)}
                    </span>
                    <span
                      className={`size-2.5 rounded-full ${
                        checked ? "bg-violet-400" : "bg-slate-600"
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
        <p className="py-8 text-center text-sm text-slate-500">
          Ajoutez une première habitude à suivre chaque jour.
        </p>
      ) : null}
    </section>
  );
};
