import { useState } from "react";
import type { FormEvent } from "react";

import {
  CATEGORIES,
  currentMonthKey,
  formatAmount,
  monthKeyOf,
  monthLabel,
  monthShortLabel,
  newId,
  shiftMonth,
  STORAGE_KEYS,
  sumExpenses,
  todayKey,
  totalsByCategory,
  useStoredState,
} from "./storage";
import type { Expense } from "./storage";
import { HouseBanner, RoomScene } from "./scene";
import type { HouseEvent } from "./scene";
import { SwipeToDelete } from "./swipe";

const lastSixMonths = (): string[] =>
  Array.from({ length: 6 }, (_, index) =>
    shiftMonth(currentMonthKey(), index - 5)
  );

type BudgetModuleProps = {
  houseEvent: HouseEvent;
  onEvent: (event: HouseEvent) => void;
};

export const BudgetModule = ({ houseEvent, onEvent }: BudgetModuleProps) => {
  const [expenses, setExpenses] = useStoredState<Expense[]>(STORAGE_KEYS.expenses, []);
  const [month, setMonth] = useState(currentMonthKey);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayKey());

  const monthExpenses = expenses
    .filter((expense) => monthKeyOf(expense.date) === month)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const total = sumExpenses(monthExpenses);
  const byCategory = totalsByCategory(monthExpenses);
  const maxCategory = byCategory[0]?.total ?? 0;

  const usage = CATEGORIES.map((entry) => ({
    entry,
    count: expenses.filter((expense) => expense.category === entry).length,
  })).sort((a, b) => b.count - a.count);

  const sixMonths = lastSixMonths();
  const sixMonthTotals = sixMonths.map((monthKey) => ({
    monthKey,
    total: sumExpenses(
      expenses.filter((expense) => monthKeyOf(expense.date) === monthKey)
    ),
  }));
  const maxSixMonth = Math.max(...sixMonthTotals.map((entry) => entry.total), 1);

  const add = (event: FormEvent) => {
    event.preventDefault();
    const value = Number(amount.replace(",", "."));
    if (Number.isNaN(value) || value <= 0) {
      return;
    }
    setExpenses((previous) => [
      ...previous,
      { id: newId(), amount: value, category, note: note.trim(), date },
    ]);
    setAmount("");
    setNote("");
    onEvent({ kind: "budget", big: value >= 100, ts: Date.now() });
  };

  const duplicate = (expense: Expense) => {
    setExpenses((previous) => [
      ...previous,
      {
        ...expense,
        id: newId(),
        date: todayKey(),
      },
    ]);
  };

  const remove = (id: string) => {
    setExpenses((previous) => previous.filter((expense) => expense.id !== id));
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="sticky top-[calc(env(safe-area-inset-top)+68px)] z-30">
        <RoomScene room="kitchen" houseEvent={houseEvent} />
        <HouseBanner />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-line bg-surface px-3 py-3">
        <button
          type="button"
          aria-label="Mois précédent"
          onClick={() => setMonth(shiftMonth(month, -1))}
          className="px-3 py-2 text-xl text-muted active:text-ink"
        >
          ‹
        </button>
        <div className="text-center">
          <p className="text-sm capitalize text-muted">{monthLabel(month)}</p>
          <p className="text-2xl font-semibold">{formatAmount(total)}</p>
        </div>
        <button
          type="button"
          aria-label="Mois suivant"
          onClick={() => setMonth(shiftMonth(month, 1))}
          className="px-3 py-2 text-xl text-muted active:text-ink"
        >
          ›
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          6 derniers mois
        </h2>
        <div className="mt-3 flex h-24 items-end gap-2">
          {sixMonthTotals.map(({ monthKey, total: value }) => (
            <div key={monthKey} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] text-muted">
                {value > 0 ? Math.round(value) : ""}
              </span>
              <div
                className={`w-full rounded-t-md ${
                  monthKey === month ? "bg-accent" : "bg-accent/40"
                }`}
                style={{
                  height: `${Math.max(
                    3,
                    Math.round((value / maxSixMonth) * 76)
                  )}px`,
                }}
              />
              <span
                className={`text-[10px] ${
                  monthKey === month ? "font-semibold text-accent-ink" : "text-muted"
                }`}
              >
                {monthShortLabel(monthKey)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={add} className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {usage.map(({ entry }) => (
            <button
              key={entry}
              type="button"
              onClick={() => setCategory(entry)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                category === entry
                  ? "border-accent bg-accent-soft font-medium text-accent-ink"
                  : "border-line text-muted"
              }`}
            >
              {entry}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            placeholder="Montant (€)"
            className="rounded-xl border border-line bg-surface px-4 py-3 text-base outline-none placeholder:text-muted focus:border-accent"
          />
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-xl border border-line bg-surface px-3 py-3 text-base outline-none focus:border-accent"
          />
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Note (facultatif)"
            className="col-span-2 rounded-xl border border-line bg-surface px-4 py-3 text-base outline-none placeholder:text-muted focus:border-accent"
          />
          <button
            type="submit"
            className="col-span-2 rounded-xl bg-accent py-3 text-base font-medium text-white active:opacity-80"
          >
            Ajouter la dépense
          </button>
        </div>
      </form>

      {byCategory.length > 0 ? (
        <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-4">
          {byCategory.map((entry) => (
            <div key={entry.category} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span>{entry.category}</span>
                <span className="text-muted">{formatAmount(entry.total)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-raised">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{
                    width: `${Math.max(
                      4,
                      Math.round((entry.total / maxCategory) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <ul className="flex flex-col gap-2">
        {monthExpenses.map((expense) => (
          <SwipeToDelete key={expense.id} onDelete={() => remove(expense.id)}>
            <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-base">
                  {expense.note === "" ? expense.category : expense.note}
                </p>
                <p className="text-xs text-muted">
                  {expense.category} · {expense.date}
                </p>
              </div>
              <span className="shrink-0 text-base font-medium">
                {formatAmount(expense.amount)}
              </span>
              <button
                type="button"
                aria-label="Dupliquer aujourd'hui"
                onClick={() => duplicate(expense)}
                className="shrink-0 text-muted active:text-ink"
              >
                ⧉
              </button>
              <button
                type="button"
                aria-label="Supprimer"
                onClick={() => remove(expense.id)}
                className="shrink-0 text-muted active:text-red-500"
              >
                ✕
              </button>
            </div>
          </SwipeToDelete>
        ))}
      </ul>

      {monthExpenses.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          Aucune dépense pour {monthLabel(month)}.
        </p>
      ) : null}
    </section>
  );
};
