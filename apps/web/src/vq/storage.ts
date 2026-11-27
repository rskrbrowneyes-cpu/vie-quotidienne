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

export type ChoreFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "spring"
  | "autumn";

export type Chore = {
  id: string;
  name: string;
  frequency: ChoreFrequency;
  section?: string;
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
  quarterly: "Trimestrielles",
  spring: "Printemps",
  autumn: "Automne",
};

export const FREQUENCY_SINGULAR: Record<ChoreFrequency, string> = {
  daily: "quotidienne",
  weekly: "hebdomadaire",
  monthly: "mensuelle",
  quarterly: "trimestrielle",
  spring: "printemps",
  autumn: "automne",
};

export const LEGACY_CHORE_NAMES = new Set([
  "Faire les lits",
  "Vaisselle & plan de travail",
  "10 minutes de rangement",
  "Surfaces & poubelles cuisine",
  "Aspirateur & sols",
  "Salle de bain & toilettes",
  "Lessive",
  "Changement des draps",
  "Courses & placards",
  "Frigo & congélateur",
  "Dépoussiérage complet",
  "Vitres & miroirs",
]);

export const DEFAULT_CHORES: Omit<Chore, "id" | "done">[] = [
  { name: "Lancer le robot aspirateur (pièce de vie / cuisine)", frequency: "daily" },
  { name: "Litière : déjections et nettoyage autour du bac", frequency: "daily" },
  { name: "Plan de travail, vaisselle, poubelles si pleines", frequency: "daily" },
  { name: "Rangement express (mezzanine, escalier, couloir/buanderie)", frequency: "daily" },

  { name: "Dépoussiérer les surfaces accessibles de la pièce de vie", frequency: "weekly", section: "Session A · pièce de vie, cuisine et sols (45 min)" },
  { name: "Nettoyer façades de meubles et poignées d'électroménager", frequency: "weekly", section: "Session A · pièce de vie, cuisine et sols (45 min)" },
  { name: "Essuyer la table et les assises", frequency: "weekly", section: "Session A · pièce de vie, cuisine et sols (45 min)" },
  { name: "Nettoyer évier, robinetterie et plaques de cuisson", frequency: "weekly", section: "Session A · pièce de vie, cuisine et sols (45 min)" },
  { name: "Aspirer hors de portée du robot (coins, tapis, panier du chat)", frequency: "weekly", section: "Session A · pièce de vie, cuisine et sols (45 min)" },
  { name: "Laver le sol de la cuisine et des zones de passage", frequency: "weekly", section: "Session A · pièce de vie, cuisine et sols (45 min)" },

  { name: "Salle de bain (lavabo, robinetterie, douche/baignoire, miroir)", frequency: "weekly", section: "Session B · sanitaires, buanderie et étage (45 min)" },
  { name: "WC séparés (cuvette, abattant, chasse d'eau)", frequency: "weekly", section: "Session B · sanitaires, buanderie et étage (45 min)" },
  { name: "Sols salle de bain, WC et couloir/buanderie", frequency: "weekly", section: "Session B · sanitaires, buanderie et étage (45 min)" },
  { name: "Dépoussiérer le couloir/buanderie (dessus des machines, produits)", frequency: "weekly", section: "Session B · sanitaires, buanderie et étage (45 min)" },
  { name: "Rampe et garde-corps de l'escalier et de la mezzanine", frequency: "weekly", section: "Session B · sanitaires, buanderie et étage (45 min)" },
  { name: "Aspirer escalier, mezzanine et chambre à l'étage", frequency: "weekly", section: "Session B · sanitaires, buanderie et étage (45 min)" },
  { name: "Aérer/changer le linge de lit et les serviettes", frequency: "weekly", section: "Session B · sanitaires, buanderie et étage (45 min)" },

  { name: "Lancer 1 à 2 lessives (vêtements, maison, textiles du chat)", frequency: "weekly", section: "Linge · au fil de la semaine" },
  { name: "Étendre, plier et ranger le linge sec", frequency: "weekly", section: "Linge · au fil de la semaine" },

  { name: "Grand dégraissage cuisine (hotte, filtres, crédence)", frequency: "monthly" },
  { name: "Intérieur du four et du micro-ondes", frequency: "monthly" },
  { name: "Trier et nettoyer les clayettes du réfrigérateur", frequency: "monthly" },
  { name: "Litière : vider, laver et désinfecter le bac", frequency: "monthly" },
  { name: "Plinthes, interrupteurs, poignées, zones hautes", frequency: "monthly" },
  { name: "Détartrer robinetterie et pommeau de douche", frequency: "monthly" },
  { name: "Entretenir le robot (bac, brosses, capteurs)", frequency: "monthly" },

  { name: "Vitres accessibles et rebords (pièce de vie, chambre, mezzanine)", frequency: "quarterly" },
  { name: "Plaids, housses, rideaux légers et couchage du chat", frequency: "quarterly" },
  { name: "Joint de hublot et bac à lessive du lave-linge", frequency: "quarterly" },
  { name: "Détartrer le petit électroménager (cafetière, bouilloire, grille-pain)", frequency: "quarterly" },
  { name: "Sous le lit et aérer/retourner le matelas", frequency: "quarterly" },

  { name: "Terrasse : nettoyer le sol et essuyer le mobilier", frequency: "spring" },
  { name: "Buissons : taille légère et débris végétaux", frequency: "spring" },
  { name: "Grilles d'aération/VMC et dessus des meubles hauts", frequency: "spring" },
  { name: "Trier et réorganiser les placards (buanderie, chambre)", frequency: "spring" },

  { name: "Feuilles mortes, terrasse et buissons", frequency: "autumn" },
  { name: "Évacuation des eaux de pluie et protection contre le gel", frequency: "autumn" },
  { name: "Grilles VMC et plinthes sur tout le duplex", frequency: "autumn" },
  { name: "Point linge et rangements avant l'hiver", frequency: "autumn" },
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
): string => {
  switch (frequency) {
    case "daily":
      return dateKey(date);
    case "weekly":
      return weekKeyOf(date);
    case "monthly":
      return monthKeyOf(dateKey(date));
    case "quarterly":
      return `${date.getFullYear()}-T${Math.floor(date.getMonth() / 3) + 1}`;
    case "spring":
      return `${date.getFullYear()}-printemps`;
    case "autumn":
      return `${date.getFullYear()}-automne`;
  }
};

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

export const XP_BY_FREQUENCY: Record<ChoreFrequency, number> = {
  daily: 10,
  weekly: 25,
  monthly: 60,
  quarterly: 120,
  spring: 150,
  autumn: 150,
};

export const xpFor = (frequency: ChoreFrequency): number =>
  XP_BY_FREQUENCY[frequency];

export const computeXp = (history: readonly ChoreHistoryEntry[]): number =>
  history.reduce((total, entry) => total + XP_BY_FREQUENCY[entry.frequency], 0);

export const levelFromXp = (
  xp: number
): { level: number; into: number; needed: number } => {
  let level = 1;
  let threshold = 0;

  while (xp >= threshold + 100 * level) {
    threshold += 100 * level;
    level += 1;
  }

  return { level, into: xp - threshold, needed: 100 * level };
};

export const rankTitle = (level: number): string => {
  if (level >= 12) {
    return "Gardien légendaire du duplex";
  }
  if (level >= 9) {
    return "Maître de la litière";
  }
  if (level >= 6) {
    return "Champion du plumeau";
  }
  if (level >= 3) {
    return "Agent confirmé du ménage";
  }
  return "Apprenti du ménage";
};

export const activityStreak = (
  chores: readonly Chore[],
  endDate = new Date()
): number => {
  const daily = chores.filter((chore) => chore.frequency === "daily");

  if (daily.length === 0) {
    return 0;
  }

  const dayActive = (offset: number): boolean => {
    const key = dateKey(
      new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - offset)
    );
    return daily.some((chore) => chore.done[key]);
  };

  let streak = 0;
  let offset = 0;

  if (!dayActive(0)) {
    offset = 1;
  }

  while (dayActive(offset)) {
    streak += 1;
    offset += 1;
  }

  return streak;
};

export type BadgeDef = { id: string; icon: string; label: string };

export const BADGES: BadgeDef[] = [
  { id: "first", icon: "🥇", label: "Première quête" },
  { id: "ten", icon: "🎯", label: "10 quêtes" },
  { id: "fifty", icon: "🏆", label: "50 quêtes" },
  { id: "litter", icon: "🐱", label: "Maître du bac" },
  { id: "streak7", icon: "🔥", label: "Série de 7" },
  { id: "level5", icon: "⭐", label: "Niveau 5" },
  { id: "level10", icon: "👑", label: "Niveau 10" },
  { id: "boss", icon: "👹", label: "Tueur de boss" },
];

export const earnedBadgeIds = (
  history: readonly ChoreHistoryEntry[],
  level: number,
  streak: number
): Set<string> => {
  const earned = new Set<string>();

  if (history.length >= 1) {
    earned.add("first");
  }
  if (history.length >= 10) {
    earned.add("ten");
  }
  if (history.length >= 50) {
    earned.add("fifty");
  }
  if (history.filter((entry) => /litière/i.test(entry.choreName)).length >= 3) {
    earned.add("litter");
  }
  if (streak >= 7) {
    earned.add("streak7");
  }
  if (level >= 5) {
    earned.add("level5");
  }
  if (level >= 10) {
    earned.add("level10");
  }
  if (
    history.some((entry) =>
      ["monthly", "quarterly", "spring", "autumn"].includes(entry.frequency)
    )
  ) {
    earned.add("boss");
  }

  return earned;
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

  return [state, setState, loaded] as const;
};
