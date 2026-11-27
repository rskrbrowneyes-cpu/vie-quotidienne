import { describe, expect, it } from "bun:test";

import {
  dateKey,
  formatAmount,
  lastNDays,
  monthKeyOf,
  monthLabel,
  currentStreak,
  shiftDays,
  shiftMonth,
  todayKey,
  activityStreak,
  bestStreak,
  computeXp,
  earnedBadgeIds,
  levelFromXp,
  chorePeriodKey,
  dailyCompletionRate,
  leastCompletedDaily,
  monthShortLabel,
  monthValidationCount,
  totalsByCategory,
  weekdayInitial,
  weekKeyOf,
} from "./storage";
import type { Chore, ChoreHistoryEntry, Expense } from "./storage";

describe("dateKey", () => {
  it("pads month and day", () => {
    expect(dateKey(new Date(2025, 0, 5))).toBe("2025-01-05");
  });
});

describe("shiftDays", () => {
  it("crosses month boundaries", () => {
    expect(shiftDays("2025-01-31", 1)).toBe("2025-02-01");
    expect(shiftDays("2025-03-01", -1)).toBe("2025-02-28");
  });
});

describe("lastNDays", () => {
  it("ends with the given day and keeps order", () => {
    expect(lastNDays(3, "2025-06-10")).toEqual([
      "2025-06-08",
      "2025-06-09",
      "2025-06-10",
    ]);
  });
});

describe("weekdayInitial", () => {
  it("matches French weekday initials", () => {
    expect(weekdayInitial("2025-06-09")).toBe("L");
    expect(weekdayInitial("2025-06-15")).toBe("D");
  });
});

describe("currentStreak", () => {
  it("counts consecutive days up to today", () => {
    const today = todayKey();
    expect(
      currentStreak({
        [today]: true,
        [shiftDays(today, -1)]: true,
        [shiftDays(today, -2)]: true,
      })
    ).toBe(3);
  });

  it("keeps yesterday's streak alive before today is checked", () => {
    const today = todayKey();
    expect(
      currentStreak({
        [shiftDays(today, -1)]: true,
        [shiftDays(today, -2)]: true,
      })
    ).toBe(2);
  });

  it("returns zero when the streak is broken", () => {
    const today = todayKey();
    expect(
      currentStreak({ [shiftDays(today, -2)]: true })
    ).toBe(0);
  });
});

describe("weekKeyOf", () => {
  it("numbers ISO weeks within a year", () => {
    expect(weekKeyOf(new Date(2026, 0, 1))).toBe("2026-S01");
    expect(weekKeyOf(new Date(2026, 10, 27))).toBe("2026-S48");
  });

  it("puts the start of a year in the last ISO week of the previous year", () => {
    expect(weekKeyOf(new Date(2027, 0, 1))).toBe("2026-S53");
  });
});

describe("chorePeriodKey", () => {
  it("uses day, ISO week and month keys per frequency", () => {
    const date = new Date(2026, 10, 27);
    expect(chorePeriodKey("daily", date)).toBe("2026-11-27");
    expect(chorePeriodKey("weekly", date)).toBe("2026-S48");
    expect(chorePeriodKey("monthly", date)).toBe("2026-11");
    expect(chorePeriodKey("quarterly", date)).toBe("2026-T4");
    expect(chorePeriodKey("spring", date)).toBe("2026-printemps");
    expect(chorePeriodKey("autumn", date)).toBe("2026-automne");
  });
});

describe("bestStreak", () => {
  it("finds the longest consecutive run", () => {
    expect(
      bestStreak({
        "2026-03-01": true,
        "2026-03-02": true,
        "2026-03-03": true,
        "2026-03-07": true,
        "2026-03-08": true,
      })
    ).toBe(3);
  });

  it("returns zero with no checks", () => {
    expect(bestStreak({})).toBe(0);
  });
});

describe("dailyCompletionRate", () => {
  it("averages daily checks over the window", () => {
    const chores: Chore[] = [
      {
        id: "1",
        name: "A",
        frequency: "daily",
        done: { "2026-11-26": true, "2026-11-25": true },
      },
      { id: "2", name: "B", frequency: "daily", done: {} },
    ];

    expect(dailyCompletionRate(chores, new Date(2026, 10, 27), 3)).toBe(33);
  });

  it("returns null without daily chores", () => {
    expect(dailyCompletionRate([], new Date(2026, 10, 27))).toBeNull();
  });
});

describe("leastCompletedDaily", () => {
  it("returns the daily chore with the fewest validations", () => {
    const chores: Chore[] = [
      {
        id: "1",
        name: "A",
        frequency: "daily",
        done: { "2026-11-27": true, "2026-11-26": true },
      },
      { id: "2", name: "B", frequency: "daily", done: { "2026-11-27": true } },
    ];

    expect(leastCompletedDaily(chores, new Date(2026, 10, 27), 2)).toEqual({
      name: "B",
      count: 1,
    });
  });
});

describe("monthValidationCount", () => {
  it("counts history entries completed in the month", () => {
    const history: ChoreHistoryEntry[] = [
      { id: "1", choreId: "a", choreName: "A", frequency: "daily", period: "2026-11-27", completedAt: "2026-11-27T18:00:00.000Z" },
      { id: "2", choreId: "b", choreName: "B", frequency: "daily", period: "2026-10-30", completedAt: "2026-10-30T18:00:00.000Z" },
    ];

    expect(monthValidationCount(history, new Date(2026, 10, 27))).toBe(1);
  });
});

describe("monthShortLabel", () => {
  it("abbreviates month names", () => {
    expect(monthShortLabel("2026-01")).toBe("janv.");
    expect(monthShortLabel("2026-08")).toBe("août");
  });
});

describe("computeXp and levelFromXp", () => {
  it("sums XP by frequency", () => {
    const history: ChoreHistoryEntry[] = [
      { id: "1", choreId: "a", choreName: "A", frequency: "daily", period: "2026-11-27", completedAt: "2026-11-27T08:00:00.000Z" },
      { id: "2", choreId: "b", choreName: "B", frequency: "weekly", period: "2026-S48", completedAt: "2026-11-27T08:00:00.000Z" },
      { id: "3", choreId: "c", choreName: "C", frequency: "monthly", period: "2026-11", completedAt: "2026-11-27T08:00:00.000Z" },
    ];

    expect(computeXp(history)).toBe(95);
  });

  it("levels up at growing thresholds", () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100).level).toBe(2);
    expect(levelFromXp(100).into).toBe(0);
    expect(levelFromXp(400).level).toBe(3);
    expect(levelFromXp(400).into).toBe(100);
  });
});

describe("activityStreak", () => {
  it("counts consecutive active days, forgiving an unfinished today", () => {
    const chores: Chore[] = [
      {
        id: "1",
        name: "A",
        frequency: "daily",
        done: (() => {
          const today = todayKey();
          return {
            [today]: true,
            [shiftDays(today, -1)]: true,
            [shiftDays(today, -2)]: true,
          };
        })(),
      },
    ];

    expect(activityStreak(chores)).toBe(3);
  });

  it("returns zero without daily chores", () => {
    expect(activityStreak([])).toBe(0);
  });
});

describe("earnedBadgeIds", () => {
  it("unlocks badges from history, level and streak", () => {
    const history: ChoreHistoryEntry[] = [
      { id: "1", choreId: "a", choreName: "Litière : déjections", frequency: "daily", period: "2026-11-27", completedAt: "2026-11-27T08:00:00.000Z" },
    ];

    const earned = earnedBadgeIds(history, 1, 0);
    expect(earned.has("first")).toBe(true);
    expect(earned.has("ten")).toBe(false);
    expect(earned.has("boss")).toBe(false);

    const advanced = earnedBadgeIds(
      [
        ...history,
        { id: "2", choreId: "b", choreName: "Litière : vider le bac", frequency: "monthly", period: "2026-11", completedAt: "2026-11-27T08:00:00.000Z" },
        { id: "3", choreId: "c", choreName: "Litière : clayettes", frequency: "daily", period: "2026-11-26", completedAt: "2026-11-26T08:00:00.000Z" },
      ],
      5,
      7
    );
    expect(advanced.has("boss")).toBe(true);
    expect(advanced.has("level5")).toBe(true);
    expect(advanced.has("streak7")).toBe(true);
    expect(advanced.has("litter")).toBe(true);
  });
});

describe("shiftMonth", () => {
  it("crosses year boundaries", () => {
    expect(shiftMonth("2025-01", -1)).toBe("2024-12");
    expect(shiftMonth("2024-12", 1)).toBe("2025-01");
  });
});

describe("monthKeyOf and monthLabel", () => {
  it("slices the month from a date key and labels it", () => {
    expect(monthKeyOf("2025-03-14")).toBe("2025-03");
    expect(monthLabel("2025-03")).toBe("mars 2025");
  });
});

describe("totalsByCategory", () => {
  it("sums per category, sorted by total", () => {
    const expenses: Expense[] = [
      { id: "1", amount: 10, category: "Alimentation", note: "", date: "2025-03-01" },
      { id: "2", amount: 5, category: "Transport", note: "", date: "2025-03-02" },
      { id: "3", amount: 7.5, category: "Alimentation", note: "", date: "2025-03-03" },
    ];

    expect(totalsByCategory(expenses)).toEqual([
      { category: "Alimentation", total: 17.5 },
      { category: "Transport", total: 5 },
    ]);
  });
});

describe("formatAmount", () => {
  it("formats euros in French", () => {
    expect(formatAmount(12.5)).toContain("12,50");
  });
});
