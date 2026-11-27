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
  chorePeriodKey,
  totalsByCategory,
  weekdayInitial,
  weekKeyOf,
} from "./storage";
import type { Expense } from "./storage";

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
