import { relations } from 'drizzle-orm';
import {
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { timestamps } from './_shared.js';
import { platformFamilyEnum } from './enums.js';
import { reviews } from './reviews.js';

export const games = pgTable(
  'games',
  {
    id: uuid().primaryKey().defaultRandom(),
    /** id no IGDB; nulo para jogos cadastrados manualmente */
    igdbId: integer().unique(),
    slug: text().notNull().unique(),
    name: text().notNull(),
    summary: text(),
    /** image_id da capa no IGDB */
    coverImageId: text(),
    releaseDate: date(),
    /** Agregados mantidos pela API ao criar/editar reviews (evita AVG a cada listagem) */
    reviewsCount: integer().notNull().default(0),
    /** Nota média em décimos (94 = 9.4); nulo sem reviews */
    scoreAvgTenths: smallint(),
    /** Última sincronização com o IGDB */
    igdbSyncedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (t) => [index('games_name_idx').on(t.name), index('games_reviews_count_idx').on(t.reviewsCount)],
);

export const platforms = pgTable('platforms', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  igdbId: integer().unique(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  family: platformFamilyEnum().notNull(),
});

export const genres = pgTable('genres', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  igdbId: integer().unique(),
  slug: text().notNull().unique(),
  name: text().notNull(),
});

export const gamePlatforms = pgTable(
  'game_platforms',
  {
    gameId: uuid()
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    platformId: integer()
      .notNull()
      .references(() => platforms.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.gameId, t.platformId] })],
);

export const gameGenres = pgTable(
  'game_genres',
  {
    gameId: uuid()
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    genreId: integer()
      .notNull()
      .references(() => genres.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.gameId, t.genreId] })],
);

export const gamesRelations = relations(games, ({ many }) => ({
  platforms: many(gamePlatforms),
  genres: many(gameGenres),
  reviews: many(reviews),
}));

export const platformsRelations = relations(platforms, ({ many }) => ({
  games: many(gamePlatforms),
}));

export const genresRelations = relations(genres, ({ many }) => ({
  games: many(gameGenres),
}));

export const gamePlatformsRelations = relations(gamePlatforms, ({ one }) => ({
  game: one(games, { fields: [gamePlatforms.gameId], references: [games.id] }),
  platform: one(platforms, { fields: [gamePlatforms.platformId], references: [platforms.id] }),
}));

export const gameGenresRelations = relations(gameGenres, ({ one }) => ({
  game: one(games, { fields: [gameGenres.gameId], references: [games.id] }),
  genre: one(genres, { fields: [gameGenres.genreId], references: [genres.id] }),
}));
