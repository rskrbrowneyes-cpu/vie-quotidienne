import { useEffect, useState } from "react";

export type Task = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  pinned?: boolean;
};

export type ReminderSettings = {
  enabled: boolean;
  time: string;
};

export const STORAGE_KEYS = {
  tasks: "vq.tasks",
  habits: "vq.habits",
  chores: "vq.chores",
  choresHistory: "vq.choresHistory",
  expenses: "vq.expenses",
  firstOpened: "vq.firstOpened",
} as const;

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
  WEEKDAY_INITIALS[parseDateKey(key).getDay()] ?? "?";

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

export const formatDateLong = (iso: string): string =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

export const monthShortLabel = (monthKey: string): string => {
  const month = Number(monthKey.split("-")[1]);
  const name = MONTHS[month - 1] ?? "janvier";
  return name.length <= 4 ? name : `${name.slice(0, 4)}.`;
};

export const bestStreak = (checks: Record<string, boolean>): number => {
  const keys = Object.keys(checks)
    .filter((key) => checks[key])
    .sort();
  let best = 0;
  let run = 0;
  let previous = "";

  for (const key of keys) {
    run = previous !== "" && shiftDays(previous, 1) === key ? run + 1 : 1;
    if (run > best) {
      best = run;
    }
    previous = key;
  }

  return best;
};

export const dailyCompletionRate = (
  chores: readonly Chore[],
  endDate = new Date(),
  days = 7
): number | null => {
  const daily = chores.filter((chore) => chore.frequency === "daily");

  if (daily.length === 0) {
    return null;
  }

  let done = 0;

  for (let offset = 0; offset < days; offset += 1) {
    const key = dateKey(
      new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - offset)
    );
    done += daily.filter((chore) => chore.done[key]).length;
  }

  return Math.round((done / (daily.length * days)) * 100);
};

export const leastCompletedDaily = (
  chores: readonly Chore[],
  endDate = new Date(),
  days = 28
): { name: string; count: number } | null => {
  const daily = chores.filter((chore) => chore.frequency === "daily");

  if (daily.length === 0) {
    return null;
  }

  const keys = Array.from({ length: days }, (_, offset) =>
    dateKey(
      new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - offset)
    )
  );
  let result: { name: string; count: number } | null = null;

  for (const chore of daily) {
    const count = keys.filter((key) => chore.done[key]).length;

    if (result === null || count < result.count) {
      result = { name: chore.name, count };
    }
  }

  return result;
};

export const monthValidationCount = (
  history: readonly ChoreHistoryEntry[],
  date = new Date()
): number =>
  history.filter(
    (entry) => entry.completedAt.slice(0, 7) === monthKeyOf(dateKey(date))
  ).length;

export const exportPayload = (): string => {
  const data: Record<string, unknown> = {
    app: "vie-quotidienne",
    version: 1,
    exportedAt: new Date().toISOString(),
  };

  for (const key of Object.values(STORAGE_KEYS)) {
    data[key] = JSON.parse(window.localStorage.getItem(key) ?? "null");
  }

  return JSON.stringify(data, null, 2);
};

export const applyImport = (raw: string): boolean => {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;

    if (data.app !== "vie-quotidienne" || data.version !== 1) {
      return false;
    }

    for (const [name, storageKey] of Object.entries(STORAGE_KEYS)) {
      const value = data[name];

      if (value === undefined || value === null) {
        continue;
      }

      if (name !== "firstOpened" && !Array.isArray(value)) {
        return false;
      }

      window.localStorage.setItem(storageKey, JSON.stringify(value));
    }

    return true;
  } catch {
    return false;
  }
};

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
