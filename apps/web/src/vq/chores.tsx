import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import {
  BADGES,
  FREQUENCY_LABELS,
  FREQUENCY_SINGULAR,
  LEGACY_CHORE_NAMES,
  activityStreak,
  chorePeriodKey,
  computeXp,
  dailyCompletionRate,
  defaultChores,
  earnedBadgeIds,
  formatDateTime,
  leastCompletedDaily,
  levelFromXp,
  monthValidationCount,
  newId,
  rankTitle,
  useStoredState,
  xpFor,
} from "./storage";
import type { Chore, ChoreFrequency, ChoreHistoryEntry } from "./storage";
import { CatScene } from "./scene";
import type { Activity } from "./scene";
import { SwipeToDelete } from "./swipe";

const FREQUENCIES: ChoreFrequency[] = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "spring",
  "autumn",
];

const GROUP_META: Record<ChoreFrequency, { icon: string; boss: boolean }> = {
  daily: { icon: "⚡", boss: false },
  weekly: { icon: "🗺️", boss: false },
  monthly: { icon: "👹", boss: true },
  quarterly: { icon: "🐉", boss: true },
  spring: { icon: "🌸", boss: true },
  autumn: { icon: "🍂", boss: true },
};

const FREQUENCY_OPTIONS: { value: ChoreFrequency; label: string }[] = [
  { value: "daily", label: "Quotidienne" },
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuelle" },
  { value: "quarterly", label: "Trimestrielle" },
  { value: "spring", label: "Printemps" },
  { value: "autumn", label: "Automne" },
];

const CHORE_THEMES: {
  pattern: RegExp;
  activity: Activity;
  emojis: [string, string];
}[] = [
  { pattern: /liti[èe]re|d[ée]jection|bac/i, activity: "litter", emojis: ["🐾", "✨"] },
  { pattern: /aspir|robot/i, activity: "vacuum", emojis: ["🫧", "✨"] },
  { pattern: /balay/i, activity: "sweep", emojis: ["🧹", "✨"] },
  { pattern: /vaisselle|évier|plaque/i, activity: "dishes", emojis: ["🫧", "✨"] },
  { pattern: /poussi|plinthe|vmc|grille|hotte|cr[ée]dence/i, activity: "dust", emojis: ["✨", "🫧"] },
  { pattern: /lessive|linge|draps|serviette|plaid|houss|rideau|matelas|textile/i, activity: "laundry", emojis: ["🫧", "🧺"] },
  { pattern: /vitre|miroir|hublot/i, activity: "windows", emojis: ["✨", "💧"] },
  { pattern: /poubelle|four|micro-ondes|d[ée]graissa|réfrigérateur|frigidaire|tarte|détart|joint/i, activity: "trash", emojis: ["🫧", "✨"] },
  { pattern: /terrasse|buisson|feuille|végétal|jardin|gel/i, activity: "garden", emojis: ["🌿", "✨"] },
  { pattern: /rang|trie|placard|rangement|organis|a[ée]rer|sol|marche|douche|wc|toilette|chasse|cuvette|salle de bain|lave-linge/i, activity: "tidy", emojis: ["📦", "✨"] },
];

const themeForChore = (
  name: string
): { activity: Activity; emojis: [string, string] } => {
  for (const theme of CHORE_THEMES) {
    if (theme.pattern.test(name)) {
      return { activity: theme.activity, emojis: theme.emojis };
    }
  }
  return { activity: "tidy", emojis: ["✨", "🫧"] };
};

const sectionsOf = (chores: readonly Chore[]) => {
  const sections: { title: string | undefined; chores: Chore[] }[] = [];

  for (const chore of chores) {
    const last = sections[sections.length - 1];
    if (last && last.title === chore.section) {
      last.chores.push(chore);
    } else {
      sections.push({ title: chore.section, chores: [chore] });
    }
  }

  return sections;
};

type Toast = { id: number; text: string };
type Particle = { id: number; emoji: string; drift: number; delay: number };

export const ChoresModule = () => {
  const [chores, setChores, choresLoaded] = useStoredState<Chore[]>(
    "vq.chores",
    [],
    defaultChores
  );
  const [history, setHistory] = useStoredState<ChoreHistoryEntry[]>(
    "vq.choresHistory",
    []
  );
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<ChoreFrequency>("daily");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [poppedId, setPoppedId] = useState<string | null>(null);
  const toastCounter = useRef(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleCounter = useRef(0);
  const [activity, setActivity] = useState<Activity>("idle");
  const [activityKey, setActivityKey] = useState(0);
  const [hopKey, setHopKey] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const activityTimer = useRef<number | null>(null);

  const xp = computeXp(history);
  const { level, into, needed } = levelFromXp(xp);
  const streak = activityStreak(chores);
  const earned = earnedBadgeIds(history, level, streak);

  const rate = dailyCompletionRate(chores);
  const forgotten = leastCompletedDaily(chores);
  const monthValidations = monthValidationCount(history);
  const dailyChores = chores.filter((chore) => chore.frequency === "daily");
  const dailyDone = dailyChores.filter(
    (chore) => chore.done[chorePeriodKey("daily")]
  ).length;
  const missionComplete =
    dailyChores.length > 0 &&
    dailyChores.every((chore) => chore.done[chorePeriodKey("daily")]);
  const prevMissionComplete = useRef(missionComplete);

  useEffect(() => {
    if (missionComplete && !prevMissionComplete.current) {
      setCelebrating(true);
      const timer = window.setTimeout(() => setCelebrating(false), 1800);
      prevMissionComplete.current = missionComplete;
      return () => window.clearTimeout(timer);
    }
    prevMissionComplete.current = missionComplete;
  }, [missionComplete]);

  useEffect(() => {
    if (
      choresLoaded &&
      chores.length > 0 &&
      chores.every((chore) => LEGACY_CHORE_NAMES.has(chore.name))
    ) {
      setChores(defaultChores());
    }
  }, [choresLoaded, chores, setChores]);

  const pushToast = (text: string) => {
    toastCounter.current += 1;
    const id = toastCounter.current;
    setToasts((previous) => [...previous, { id, text }]);
    window.setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, 1400);
  };

  const spawnParticles = (choreName: string) => {
    const { activity: next, emojis } = themeForChore(choreName);
    const [first, second] = emojis;
    const drifts = [-18, 4, 20];
    particleCounter.current += 1;
    const base = particleCounter.current;
    setParticles((previous) => [
      ...previous,
      ...drifts.map((drift, index) => ({
        id: base + index,
        emoji: index % 2 === 0 ? first : second,
        drift,
        delay: index * 90,
      })),
    ]);
    window.setTimeout(() => {
      setParticles((previous) =>
        previous.filter((particle) => particle.id < base + drifts.length)
      );
    }, 1500);

    if (activityTimer.current !== null) {
      window.clearTimeout(activityTimer.current);
    }
    setActivity(next);
    setActivityKey((previous) => previous + 1);
    activityTimer.current = window.setTimeout(() => {
      setActivity("idle");
      activityTimer.current = null;
    }, 3200);
  };

  const add = (event: FormEvent) => {
    event.preventDefault();
    const value = name.trim();
    if (value === "") {
      return;
    }
    setChores((previous) => [
      ...previous,
      { id: newId(), name: value, frequency, done: {} },
    ]);
    setName("");
  };

  const toggle = (chore: Chore) => {
    const key = chorePeriodKey(chore.frequency);
    const wasChecked = Boolean(chore.done[key]);
    setChores((previous) =>
      previous.map((entry) =>
        entry.id === chore.id
          ? { ...entry, done: { ...entry.done, [key]: !entry.done[key] } }
          : entry
      )
    );

    if (!wasChecked) {
      setPoppedId(chore.id);
      window.setTimeout(() => setPoppedId(null), 300);

      spawnParticles(chore.name);

      const gained = xpFor(chore.frequency);
      const nextLevel = levelFromXp(computeXp(history) + gained).level;

      setHistory((previous) => [
        {
          id: newId(),
          choreId: chore.id,
          choreName: chore.name,
          frequency: chore.frequency,
          period: key,
          completedAt: new Date().toISOString(),
        },
        ...previous.filter(
          (entry) => !(entry.choreId === chore.id && entry.period === key)
        ),
      ]);

      pushToast(`+${gained} XP`);
      if (nextLevel > level) {
        pushToast(`🎉 Niveau ${nextLevel} atteint !`);
        setHopKey((previous) => previous + 1);
      }
    }
  };

  const removeEntry = (id: string) => {
    setHistory((previous) => previous.filter((entry) => entry.id !== id));
  };

  const clearHistory = () => {
    if (window.confirm("Supprimer tout l'historique ? L'XP repartira de zéro.")) {
      setHistory([]);
    }
  };

  const remove = (id: string) => {
    setChores((previous) => previous.filter((chore) => chore.id !== id));
  };

  const historyEntries = [...history].sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt)
  );

  const progress =
    dailyChores.length === 0 ? 0 : dailyDone / dailyChores.length;

  return (
    <section className="flex flex-col gap-4">
      <div className="sticky top-[calc(env(safe-area-inset-top)+68px)] z-30">
        <CatScene
          progress={progress}
          complete={missionComplete}
          celebrating={celebrating}
          activity={activity}
          activityKey={activityKey}
          hopKey={hopKey}
          particles={particles}
        />
        <div className="rounded-b-2xl border-2 border-t-0 border-accent bg-surface/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              Niveau {level} · {rankTitle(level)}
            </p>
            <p className="text-sm font-bold text-accent-ink">{xp} XP</p>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-raised">
            <div
              className="animate-vq-shine h-full rounded-full bg-accent"
              style={{ width: `${Math.round((into / needed) * 100)}%` }}
            />
          </div>
          <p className="mt-1 flex items-center justify-between text-[10px] text-muted">
            <span>
              🔥 {streak} j · 🗓️ {monthValidations} ce mois
              {rate !== null ? ` · ⚡ ${rate} %` : ""}
            </span>
            <span>
              🧼 {Math.round(progress * 100)} % · {into}/{needed} XP
            </span>
          </p>
        </div>
      </div>

      <div
        className={`relative overflow-hidden rounded-2xl border p-4 ${
          missionComplete
            ? "border-accent bg-accent-soft"
            : "border-dashed border-line bg-surface"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">
            {missionComplete ? "🎉 Mission accomplie !" : "⚡ Mission du jour"}
          </p>
          <span className="text-xs text-muted">
            {dailyDone}/{dailyChores.length}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-raised">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{
              width: `${
                dailyChores.length === 0
                  ? 0
                  : Math.round((dailyDone / dailyChores.length) * 100)
              }%`,
            }}
          />
        </div>
        {missionComplete ? (
          <p className="mt-2 text-xs text-accent-ink">
            Kotton est fier de vous. ✨ Revenez demain pour une nouvelle quête !
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted">
            {dailyChores.length - dailyDone} quête
            {dailyChores.length - dailyDone > 1 ? "s" : ""} restante
            {dailyChores.length - dailyDone > 1 ? "s" : ""} aujourd'hui
          </p>
        )}
      </div>

      {forgotten !== null && forgotten.count < 28 ? (
        <p className="px-1 text-xs text-muted">
          💡 Mission prioritaire : <strong>{forgotten.name}</strong> (
          {forgotten.count}/28 jours)
        </p>
      ) : null}

      <form onSubmit={add} className="grid grid-cols-2 gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Créer une quête…"
          className="col-span-2 rounded-xl border border-line bg-surface px-4 py-3 text-base outline-none placeholder:text-muted focus:border-accent"
        />
        <select
          value={frequency}
          onChange={(event) => setFrequency(event.target.value as ChoreFrequency)}
          className="rounded-xl border border-line bg-surface px-3 py-3 text-base outline-none focus:border-accent"
        >
          {FREQUENCY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-accent py-3 text-base font-medium text-white active:opacity-80"
        >
          Ajouter
        </button>
      </form>

      {FREQUENCIES.map((group) => {
        const groupChores = chores.filter((chore) => chore.frequency === group);
        const doneCount = groupChores.filter(
          (chore) => chore.done[chorePeriodKey(group)]
        ).length;
        const meta = GROUP_META[group];
        const sections = sectionsOf(groupChores);

        return (
          <div key={group} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between px-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {meta.icon} {FREQUENCY_LABELS[group]}
                {meta.boss ? (
                  <span className="ml-1.5 rounded bg-accent-soft px-1.5 py-0.5 text-[9px] font-bold text-accent-ink">
                    BOSS
                  </span>
                ) : null}
              </h2>
              <span className="text-xs text-muted">
                {doneCount}/{groupChores.length}
              </span>
            </div>
            {sections.map((section, sectionIndex) => {
              const sectionDone = section.chores.filter(
                (chore) => chore.done[chorePeriodKey(chore.frequency)]
              ).length;

              return (
                <div
                  key={section.title ?? `section-${sectionIndex}`}
                  className="flex flex-col gap-2"
                >
                  {section.title !== undefined ? (
                    <div className="flex items-baseline justify-between px-1">
                      <p className="text-xs font-medium text-accent-ink">
                        {section.title}
                      </p>
                      <span className="text-xs text-muted">
                        {sectionDone}/{section.chores.length}
                      </span>
                    </div>
                  ) : null}
                  <ul className="flex flex-col gap-2">
                    {section.chores.map((chore) => {
                      const checked = Boolean(
                        chore.done[chorePeriodKey(chore.frequency)]
                      );
                      return (
                        <SwipeToDelete
                          key={chore.id}
                          onDelete={() => remove(chore.id)}
                        >
                          <div
                            className={`flex items-center gap-2.5 rounded-xl border bg-surface px-3.5 py-3 ${
                              checked
                                ? "border-accent bg-accent-soft"
                                : meta.boss
                                  ? "border-amber-400/60"
                                  : "border-line"
                            }`}
                          >
                            <button
                              type="button"
                              aria-label={checked ? "Invalider" : "Valider"}
                              onClick={() => toggle(chore)}
                              className={`flex size-7 shrink-0 items-center justify-center rounded-lg border-2 ${
                                checked
                                  ? "border-accent bg-accent text-white"
                                  : "border-line bg-canvas"
                              } ${poppedId === chore.id ? "animate-vq-pop" : ""}`}
                            >
                              {checked ? "⚔" : ""}
                            </button>
                            <span
                              className={`min-w-0 flex-1 text-base ${
                                checked ? "text-muted line-through" : ""
                              }`}
                            >
                              {chore.name}
                            </span>
                            <span className="shrink-0 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent-ink">
                              +{xpFor(chore.frequency)}
                            </span>
                            <button
                              type="button"
                              aria-label="Supprimer"
                              onClick={() => remove(chore.id)}
                              className="shrink-0 text-muted active:text-red-500"
                            >
                              ✕
                            </button>
                          </div>
                        </SwipeToDelete>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
            {groupChores.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line px-4 py-3 text-center text-sm text-muted">
                Aucune quête {FREQUENCY_SINGULAR[group]}.
              </p>
            ) : null}
          </div>
        );
      })}

      <div className="flex flex-col gap-2">
        <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-muted">
          🏅 Exploits
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {BADGES.map((badge) => {
            const unlocked = earned.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center ${
                  unlocked
                    ? "border-accent bg-accent-soft"
                    : "border-line bg-surface opacity-50"
                }`}
              >
                <span
                  className={`text-xl ${unlocked ? "" : "grayscale"}`}
                  aria-hidden
                >
                  {unlocked ? badge.icon : "🔒"}
                </span>
                <span className="text-[9px] leading-tight text-muted">
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Journal des quêtes ({historyEntries.length})
          </h2>
          {historyEntries.length > 0 ? (
            <button
              type="button"
              onClick={clearHistory}
              className="text-xs font-medium text-red-500"
            >
              Tout supprimer
            </button>
          ) : null}
        </div>
        <ul className="flex flex-col gap-2">
          {historyEntries.map((entry) => (
            <SwipeToDelete
              key={entry.id}
              onDelete={() => removeEntry(entry.id)}
            >
              <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{entry.choreName}</p>
                  <p className="text-xs text-muted">
                    {FREQUENCY_SINGULAR[entry.frequency]} ·{" "}
                    {formatDateTime(entry.completedAt)}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-semibold text-accent-ink">
                  +{xpFor(entry.frequency)}
                </span>
                <button
                  type="button"
                  aria-label="Supprimer du journal"
                  onClick={() => removeEntry(entry.id)}
                  className="shrink-0 text-muted active:text-red-500"
                >
                  ✕
                </button>
              </div>
            </SwipeToDelete>
          ))}
        </ul>
        {historyEntries.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">
            Vos quêtes accomplies s'afficheront ici.
          </p>
        ) : null}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-1">
        {toasts.map((toast) => (
          <span
            key={toast.id}
            className="animate-vq-float rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-canvas shadow-lg"
          >
            {toast.text}
          </span>
        ))}
      </div>
    </section>
  );
};
