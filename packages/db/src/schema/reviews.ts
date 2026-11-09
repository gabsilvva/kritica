import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  smallint,
  text,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { timestamps } from './_shared.js';
import { platformFamilyEnum } from './enums.js';
import { games } from './games.js';
import { users } from './users.js';

export const reviews = pgTable(
  'reviews',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    gameId: uuid()
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    /** Nota em décimos: 0–100 (95 = 9.5). Converta com scoreToTenths/tenthsToScore. */
    scoreTenths: smallint().notNull(),
    title: text(),
    body: text().notNull(),
    platform: platformFamilyEnum(),
    hoursPlayed: integer(),
    /** Horas confirmadas via Steam/PSN/Xbox → selo "Jogou de verdade" */
    hoursVerified: boolean().notNull().default(false),
    containsSpoilers: boolean().notNull().default(false),
    likesCount: integer().notNull().default(0),
    ...timestamps,
  },
  (t) => [
    // uma review por pessoa por jogo (editar em vez de duplicar)
    unique('reviews_user_game_unique').on(t.userId, t.gameId),
    index('reviews_game_created_idx').on(t.gameId, t.createdAt),
    index('reviews_created_idx').on(t.createdAt),
    check('reviews_score_range', sql`${t.scoreTenths} BETWEEN 0 AND 100 AND ${t.scoreTenths} % 5 = 0`),
    check('reviews_hours_positive', sql`${t.hoursPlayed} IS NULL OR ${t.hoursPlayed} >= 0`),
  ],
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  author: one(users, { fields: [reviews.userId], references: [users.id] }),
  game: one(games, { fields: [reviews.gameId], references: [games.id] }),
}));
