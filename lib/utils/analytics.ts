
/**
 * Calculates the start and end dates for a given duration.
 *
 * @param duration - The duration for which to calculate the date range. 
 *                   Supported values are:
 *                   - `"week"`: The current week starting from Monday.
 *                   - `"last-week"`: The previous week starting from Monday.
 *                   - `"month"`: The current month starting from the 1st.
 *                   - `"last-month"`: The previous month.
 *                   - `"year"`: The current year starting from January 1st.
 *                   - `"last-year"`: The previous year.
 * @returns An object containing:
 *          - `startDate`: The start date of the range.
 *          - `endDate`: The end date of the range.
 * @throws Will throw an error if the provided duration is unsupported.
 */
export function getDateRangeFromDuration(duration: Duration): { startDate: Date; endDate: Date } {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  const setStartOfDay = (date: Date) => {
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const setEndOfDay = (date: Date) => {
    date.setHours(23, 59, 59, 999);
    return date;
  };

  switch (duration) {
    case "week": {
      const day = now.getDay() || 7; // treat Sunday as 7
      const diff = day - 1; // back to Monday
      start.setDate(now.getDate() - diff);
      return { startDate: setStartOfDay(start), endDate: now };
    }

    case "last-week": {
      const day = now.getDay() || 7;
      start.setDate(now.getDate() - day - 6); // last Monday
      end.setDate(start.getDate() + 6); // next Sunday
      return { startDate: setStartOfDay(start), endDate: setEndOfDay(end) };
    }

    case "month": {
      start.setDate(1);
      return { startDate: setStartOfDay(start), endDate: now };
    }

    case "last-month": {
      start.setMonth(now.getMonth() - 1, 1);
      end.setMonth(start.getMonth() + 1, 0); // last day of last month
      return { startDate: setStartOfDay(start), endDate: setEndOfDay(end) };
    }

    case "year": {
      start.setMonth(0, 1); // Jan 1
      return { startDate: setStartOfDay(start), endDate: now };
    }

    case "last-year": {
      const lastYear = now.getFullYear() - 1;
      start.setFullYear(lastYear, 0, 1); // Jan 1 last year
      end.setFullYear(lastYear, 11, 31); // Dec 31 last year
      return { startDate: setStartOfDay(start), endDate: setEndOfDay(end) };
    }

    default:
      throw new Error(`Unsupported duration: ${duration}`);
  }
}
