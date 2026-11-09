import { z } from 'zod';
import { idSchema } from './common.js';

/** Contas externas que podem ser conectadas a um usuário do Kritica */
export const ACCOUNT_PROVIDERS = ['google', 'discord', 'twitch', 'steam'] as const;
export const accountProviderSchema = z.enum(ACCOUNT_PROVIDERS);
export type AccountProvider = z.infer<typeof accountProviderSchema>;

export const usernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9_]+$/, 'Use só letras minúsculas, números e _');

/** Forma resumida usada em cards de review, comentários, rankings… */
export const userSummarySchema = z.object({
  id: idSchema,
  username: usernameSchema,
  displayName: z.string(),
  avatarUrl: z.url().nullable(),
});
export type UserSummary = z.infer<typeof userSummarySchema>;
