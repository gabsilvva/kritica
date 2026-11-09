import { z } from 'zod';

/**
 * Famílias de plataforma usadas nos filtros e nas reviews.
 * O banco (@kritica/db) importa esta lista para criar o enum do Postgres,
 * então front, back e banco nunca ficam dessincronizados.
 */
export const PLATFORM_FAMILIES = ['pc', 'playstation', 'xbox', 'nintendo', 'mobile'] as const;
export const platformFamilySchema = z.enum(PLATFORM_FAMILIES);
export type PlatformFamily = z.infer<typeof platformFamilySchema>;

export const PLATFORM_FAMILY_LABELS: Record<PlatformFamily, string> = {
  pc: 'PC',
  playstation: 'PlayStation',
  xbox: 'Xbox',
  nintendo: 'Nintendo',
  mobile: 'Mobile',
};
