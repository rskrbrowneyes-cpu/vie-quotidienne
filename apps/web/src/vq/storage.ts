import { useEffect, useState } from "react";

export type Task = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};

export type Habit = {
  id: string;
  emoji: string;
  name: string;
  createdAt: string;
  checks: Record<string, boolean>;
};

export type ChoreFrequency = "daily" | "weekly" | "monthly";

export type Chore = {
  id: string;
  name: string;
  frequency: ChoreFrequency;
  done: Record<string, boolean>;
};

export type ChoreHistoryEntry = {
  id: string;
  choreId: string;
  choreName: string;
  frequency: ChoreFrequency;
  period: string;
  completedAt: string;
};

export type Expense = {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
};

export const CATEGORIES = [
  "Alimentation",
  "Transport",
  "Logement",
  "Loisirs",
  "Santé",
  "Autre",
] as const;

export const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const;

export const WEEKDAY_INITIALS = ["D", "L", "M", "M", "J", "V", "S"] as const;

export const FREQUENCY_LABELS: Record<ChoreFrequency, string> = {
  daily: "Quotidiennes",
  weekly: "Hebdomadaires",
  monthly: "Mensuelles",
};

export const DEFAULT_CHORES: Omit<Chore, "id" | "done">[] = [
  { name: "Faire les lits", frequency: "daily" },
  { name: "Vaisselle & plan de travail", frequency: "daily" },
  { name: "10 minutes de rangement", frequency: "daily" },
  { name: "Surfaces & poubelles cuisine", frequency: "daily" },
  { name: "Aspirateur & sols", frequency: "weekly" },
  { name: "Salle de bain & toilettes", frequency: "weekly" },
  { name: "Lessive", frequency: "weekly" },
  { name: "Changement des draps", frequency: "weekly" },
  { name: "Courses & placards", frequency: "weekly" },
  { name: "Frigo & congélateur", frequency: "monthly" },
  { name: "Dépoussiérage complet", frequency: "monthly" },
  { name: "Vitres & miroirs", frequency: "monthly" },
];

export const defaultChores = (): Chore[] =>
  DEFAULT_CHORES.map((chore) => ({
    ...chore,
    id: newId(),
    done: {},
  }));

export const dateKey = (date: Date): string =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

export const todayKey = (): string => dateKey(new Date());

export const parseDateKey = (key: string): Date => {
  const [year, month, day] = key.split("-").map(Number) as [
    number,
    number,
    number,
  ];
  return new Date(year, month - 1, day);
};

export const shiftDays = (key: string, days: number): string => {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return dateKey(date);
};

export const lastNDays = (count: number, end = todayKey()): string[] =>
  Array.from({ length: count }, (_, index) =>
    shiftDays(end, index - (count - 1))
  );

export const weekdayInitial = (key: string): string =>
  WEEKDAY_INITIALS[parseDateKey(key).getDay()];

export const currentStreak = (checks: Record<string, boolean>): number => {
  let streak = 0;
  let cursor = todayKey();

  if (!checks[cursor]) {
    cursor = shiftDays(cursor, -1);
  }

  while (checks[cursor]) {
    streak += 1;
    cursor = shiftDays(cursor, -1);
  }

  return streak;
};

export const monthKeyOf = (key: string): string => key.slice(0, 7);

export const chorePeriodKey = (
  frequency: ChoreFrequency,
  date = new Date()
): string =>
  frequency === "daily"
    ? dateKey(date)
    : frequency === "weekly"
      ? weekKeyOf(date)
      : monthKeyOf(dateKey(date));

export const formatDateTime = (iso: string): string =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export const weekKeyOf = (date = new Date()): string => {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  target.setDate(target.getDate() - ((target.getDay() + 6) % 7) + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86_400_000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7
    );
  return `${target.getFullYear()}-S${String(week).padStart(2, "0")}`;
};

export const currentMonthKey = (): string => todayKey().slice(0, 7);

export const shiftMonth = (monthKey: string, months: number): string => {
  const [year, month] = monthKey.split("-").map(Number) as [number, number];
  const date = new Date(year, month - 1 + months, 1);
  return [
    String(date.getFullYear()),
    String(date.getMonth() + 1).padStart(2, "0"),
  ].join("-");
};

export const monthLabel = (monthKey: string): string => {
  const [year, month] = monthKey.split("-").map(Number) as [number, number];
  return `${MONTHS[month - 1]} ${year}`;
};

export const todayLabel = (): string => {
  const date = new Date();
  return `${MONTHS[date.getMonth()]} ${date.getDate()} · ${WEEKDAY_INITIALS[date.getDay()]}`;
};

export const formatAmount = (amount: number): string =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    amount
  );

export const sumExpenses = (expenses: readonly Expense[]): number =>
  expenses.reduce((total, expense) => total + expense.amount, 0);

export const totalsByCategory = (
  expenses: readonly Expense[]
): { category: string; total: number }[] =>
  CATEGORIES.map((category) => ({
    category,
    total: sumExpenses(expenses.filter((expense) => expense.category === category)),
  })).filter((entry) => entry.total > 0)
    .sort((a, b) => b.total - a.total);

export const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useStoredState = <T,>(key: string, initial: T, seed?: () => T) => {
  const [state, setState] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) {
        if (seed) {
          setState(seed());
        }
      } else {
        setState(JSON.parse(raw) as T);
      }
    } catch {
      setLoaded(true);
      return;
    }
    setLoaded(true);
  }, [key, seed]);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      return;
    }
  }, [key, loaded, state]);

  return [state, setState] as const;
};
