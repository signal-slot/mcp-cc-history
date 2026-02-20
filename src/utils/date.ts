export function matchesDateRange(
  timestampMs: number,
  startDate?: string,
  endDate?: string,
): boolean {
  if (!startDate && !endDate) return true;

  const date = new Date(timestampMs);
  const dateStr = date.toISOString().slice(0, 10);

  if (startDate && dateStr < startDate) return false;
  if (endDate && dateStr > endDate) return false;
  return true;
}

export function matchesDateRangeISO(
  isoString: string,
  startDate?: string,
  endDate?: string,
): boolean {
  if (!startDate && !endDate) return true;
  const dateStr = isoString.slice(0, 10);
  if (startDate && dateStr < startDate) return false;
  if (endDate && dateStr > endDate) return false;
  return true;
}
