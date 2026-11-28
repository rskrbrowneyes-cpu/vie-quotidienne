export type TabId = "tasks" | "habits" | "chores" | "kotton" | "budget" | "agent";

export const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "tasks", label: "Tâches", icon: "✓" },
  { id: "habits", label: "Habitudes", icon: "◎" },
  { id: "chores", label: "Maison", icon: "⌂" },
  { id: "kotton", label: "Kotton", icon: "🐾" },
  { id: "budget", label: "Budget", icon: "€" },
  { id: "agent", label: "Agent", icon: "✦" },
];
