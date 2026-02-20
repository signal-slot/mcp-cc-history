import type { PaginatedResult } from "../types.js";

export function paginate<T>(
  items: T[],
  offset: number,
  limit: number,
): PaginatedResult<T> {
  const total = items.length;
  const sliced = items.slice(offset, offset + limit);
  return {
    items: sliced,
    total,
    offset,
    limit,
    hasMore: offset + limit < total,
  };
}
