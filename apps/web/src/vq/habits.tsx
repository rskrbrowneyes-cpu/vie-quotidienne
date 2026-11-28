import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  bestStreak,
  currentMonthKey,
  currentStreak,
  lastNDays,
  monthKeyOf,
  newId,
  shiftMonth,
  STORAGE_KEYS,
  useStoredState,
  weekdayInitial,
} from "./storage";
import type { Habit } from "./storage";
import { HouseBanner, RoomScene } from "./scene";
import type { HouseEvent } from "./scene";
import { SwipeZone } from "./swipe-nav";

const previousMonthCells = (
  checks: Record<string, boolean>
): (string | null)[] => {
  const monthKey = shiftMonth(currentMonthKey(), -1);
  const [year, month] = monthKey.split("-").map(Number) as [number, number];
  const dayCount = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: dayCount }, (_, index) => {
      const key = `${monthKey}-${String(index + 1).padStart(2, "0")}`;
      return checks[key] ? key : `off:${key}`;
    }),
  ];
};

const HabitCard = ({
  habit,
  days,
  onToggle,
  onRemove,
}: {
  habit: Habit;
  days: string[];
  onToggle: (habitId: string, day: string) => void;
  onRemove: (habitId: string) => void;
}) => {
  const [showPrevious, setShowPrevious] = useState(false);
  const monthChecks = useMemo(
    () =>
      Object.keys(habit.checks).filter(
        (key) => habit.checks[key] && monthKeyOf(key) === currentMonthKey()
      ).length,
    [habit.checks]
  );
  const previousCells = useMemo(
    () => (showPrevious ? previousMonthCells(habit.checks) : []),
    [showPrevious, habit.checks]
  );

  return (
    <li className="rounded-2xl border border-line bg-surface p-4">
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
          onClick={() => onRemove(habit.id)}
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
              onClick={() => onToggle(habit.id, day)}
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

      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>
          ⭐ {bestStreak(habit.checks)} record · ✅ {monthChecks}/
          {new Date().getDate()} ce mois
        </span>
        <button
          type="button"
          onClick={() => setShowPrevious((value) => !value)}
          className="font-medium text-accent-ink"
        >
          {showPrevious ? "Masquer" : "Mois précédent"}
        </button>
      </div>

      {showPrevious ? (
        <div className="mt-3 grid grid-cols-7 gap-1">
          {previousCells.map((cell, index) =>
            cell === null ? (
              <span key={`blank-${index}`} />
            ) : (
              <span
                key={cell}
                className="flex flex-col items-center gap-1 rounded-lg bg-raised py-1.5"
              >
                <span className="text-[9px] text-muted">
                  {cell.startsWith("off:")
                    ? weekdayInitial(cell.slice(4))
                    : weekdayInitial(cell)}
                </span>
                <span
                  className={`size-2 rounded-full ${
                    cell.startsWith("off:") ? "bg-line" : "bg-accent"
                  }`}
                />
              </span>
            )
          )}
        </div>
      ) : null}
    </li>
  );
};

type HabitsModuleProps = {
  houseEvent: HouseEvent;
  onEvent: (event: HouseEvent) => void;
};

export const HabitsModule = ({ houseEvent, onEvent }: HabitsModuleProps) => {
  const [habits, setHabits] = useStoredState<Habit[]>(STORAGE_KEYS.habits, []);
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
    const habit = habits.find((entry) => entry.id === habitId);
    const wasChecked = habit?.checks[day] ?? false;
    setHabits((previous) =>
      previous.map((entry) =>
        entry.id === habitId
          ? {
              ...entry,
              checks: { ...entry.checks, [day]: !entry.checks[day] },
            }
          : entry
      )
    );
    if (!wasChecked) {
      onEvent({ kind: "habit", ts: Date.now() });
    }
  };

  const remove = (habitId: string) => {
    setHabits((previous) => previous.filter((habit) => habit.id !== habitId));
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="sticky top-[calc(env(safe-area-inset-top)+68px)] z-30">
        <SwipeZone>
          <RoomScene room="laundry" houseEvent={houseEvent} />
        </SwipeZone>
        <HouseBanner />
      </div>

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
          <HabitCard
            key={habit.id}
            habit={habit}
            days={days}
            onToggle={toggle}
            onRemove={remove}
          />
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
