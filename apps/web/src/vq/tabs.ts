export type TabId = "tasks" | "habits" | "chores" | "kotton" | "budget";

export const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "tasks", label: "Tâches", icon: "✓" },
  { id: "habits", label: "Habitudes", icon: "◎" },
  { id: "chores", label: "Maison", icon: "⌂" },
  { id: "kotton", label: "Kotton", icon: "🐾" },
  { id: "budget", label: "Budget", icon: "€" },
];
