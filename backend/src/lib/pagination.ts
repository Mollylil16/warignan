import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export function resolvePagination(
  q: PaginationQuery,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {}
) {
  const page = q.page ?? defaults.page ?? 1;
  const maxLimit = defaults.maxLimit ?? 100;
  const limit = Math.min(maxLimit, q.limit ?? defaults.limit ?? 20);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function listMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
