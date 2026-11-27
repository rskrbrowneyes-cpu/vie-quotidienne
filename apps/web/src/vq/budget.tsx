import { useState } from "react";
import type { FormEvent } from "react";

import {
  CATEGORIES,
  currentMonthKey,
  formatAmount,
  monthKeyOf,
  monthLabel,
  newId,
  shiftMonth,
  sumExpenses,
  todayKey,
  totalsByCategory,
  useStoredState,
} from "./storage";
import type { Expense } from "./storage";

export const BudgetModule = () => {
  const [expenses, setExpenses] = useStoredState<Expense[]>("vq.expenses", []);
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
  };

  const remove = (id: string) => {
    setExpenses((previous) => previous.filter((expense) => expense.id !== id));
  };

  return (
    <section className="flex flex-col gap-4">
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

      <form onSubmit={add} className="grid grid-cols-2 gap-2">
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          inputMode="decimal"
          placeholder="Montant (€)"
          className="rounded-xl border border-line bg-surface px-4 py-3 text-base outline-none placeholder:text-muted focus:border-accent"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-xl border border-line bg-surface px-3 py-3 text-base outline-none focus:border-accent"
        >
          {CATEGORIES.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Note (facultatif)"
          className="col-span-2 rounded-xl border border-line bg-surface px-4 py-3 text-base outline-none placeholder:text-muted focus:border-accent"
        />
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded-xl border border-line bg-surface px-3 py-3 text-base outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-xl bg-accent py-3 text-base font-medium text-white active:opacity-80"
        >
          Ajouter
        </button>
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
          <li
            key={expense.id}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3"
          >
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
              aria-label="Supprimer"
              onClick={() => remove(expense.id)}
              className="shrink-0 text-muted active:text-red-500"
            >
              ✕
            </button>
          </li>
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
