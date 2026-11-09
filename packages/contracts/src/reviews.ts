import { z } from 'zod';
import { idSchema } from './common.js';
import { platformFamilySchema } from './platforms.js';
import { scoreSchema, verdictSchema } from './score.js';
import { userSummarySchema } from './users.js';

/** POST /reviews — usado também no formulário do front */
export const createReviewSchema = z.object({
  gameId: idSchema,
  score: scoreSchema,
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(20, 'Conte um pouco mais (mín. 20 caracteres)').max(5000),
  platform: platformFamilySchema.optional(),
  hoursPlayed: z.number().int().min(0).max(100_000).optional(),
  containsSpoilers: z.boolean().default(false),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

/** PATCH /reviews/:id — o jogo não pode mudar */
export const updateReviewSchema = createReviewSchema.omit({ gameId: true }).partial();
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

/** Review como a API devolve */
export const reviewSchema = z.object({
  id: idSchema,
  gameId: idSchema,
  author: userSummarySchema,
  score: scoreSchema,
  verdict: verdictSchema,
  title: z.string().nullable(),
  body: z.string(),
  platform: platformFamilySchema.nullable(),
  hoursPlayed: z.number().int().nullable(),
  /** true quando as horas vieram de Steam/PSN/Xbox (selo "Jogou de verdade") */
  hoursVerified: z.boolean(),
  containsSpoilers: z.boolean(),
  likesCount: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Review = z.infer<typeof reviewSchema>;
