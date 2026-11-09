import { z } from 'zod';
import { idSchema, paginationQuerySchema, slugSchema } from './common.js';
import { platformFamilySchema } from './platforms.js';
import { scoreSchema, verdictSchema } from './score.js';

/** O que aparece no card de jogo (grades, carrosséis, busca) */
export const gameSummarySchema = z.object({
  id: idSchema,
  slug: slugSchema,
  name: z.string(),
  /** image_id do IGDB; o front monta a URL no tamanho que precisar */
  coverImageId: z.string().nullable(),
  releaseDate: z.iso.date().nullable(),
  platforms: z.array(platformFamilySchema),
  score: scoreSchema.nullable(),
  verdict: verdictSchema.nullable(),
  reviewsCount: z.number().int().nonnegative(),
});
export type GameSummary = z.infer<typeof gameSummarySchema>;

/** Página do jogo */
export const gameDetailSchema = gameSummarySchema.extend({
  summary: z.string().nullable(),
  genres: z.array(z.object({ slug: slugSchema, name: z.string() })),
});
export type GameDetail = z.infer<typeof gameDetailSchema>;

export const GAME_SORTS = ['most_reviews', 'top_rated', 'recent'] as const;

/** GET /games?platform=pc&sort=top_rated&limit=24 */
export const listGamesQuerySchema = paginationQuerySchema.extend({
  platform: platformFamilySchema.optional(),
  sort: z.enum(GAME_SORTS).default('most_reviews'),
  q: z.string().trim().min(1).max(100).optional(),
});
export type ListGamesQuery = z.infer<typeof listGamesQuerySchema>;
