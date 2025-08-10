import { eachHourOfInterval, eachDayOfInterval } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";

type Row = { date: Date; value: number | null; count: number };

export function fillTimeGapsTZ(
  rows: Row[],
  start: Date,
  end: Date,
  unit: "hour" | "day",
  tz = "Europe/Warsaw"
) {
  // Zamień wiersze z DB na mapę: "yyyy-MM-dd HH:00:00" -> Row
  const keyOf = (d: Date) =>
    formatInTimeZone(
      d,
      tz,
      unit === "hour" ? "yyyy-MM-dd HH:00:00" : "yyyy-MM-dd 00:00:00"
    );

  const map = new Map<string, { value: number | null; count: number }>();
  for (const r of rows) {
    const k = keyOf(toZonedTime(new Date(r.date), tz)); // new Date(...) jeśli r.date bywa stringiem
    map.set(k, {
      value: r.value === null ? null : Number(r.value),
      count: Number(r.count),
    });
  }

  // Wygeneruj pełną listę bucketów w danym interwale
  const generator = unit === "hour" ? eachHourOfInterval : eachDayOfInterval;
  const all = generator({ start, end });

  // Złóż rezultat – jeśli brakuje bucketa, wstaw null/0
  return all.map((d) => {
    const k = keyOf(d);
    const found = map.get(k);
    return {
      date: new Date(d), // zawsze początek bucketa w UTC (kanonicznie)
      value: found ? found.value : null,
      count: found ? found.count : null,
    };
  });
}
