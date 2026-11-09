import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './_shared.js';
import { accountProviderEnum } from './enums.js';
import { reviews } from './reviews.js';

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  /** @handle público, único, minúsculo */
  username: text().notNull().unique(),
  displayName: text().notNull(),
  email: text().unique(),
  avatarUrl: text(),
  bio: text(),
  ...timestamps,
});

/** Contas conectadas: login social e integrações (Discord, Twitch, Steam, Google) */
export const accounts = pgTable(
  'accounts',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: accountProviderEnum().notNull(),
    /** id do usuário na plataforma externa (ex.: SteamID64, id do Discord) */
    providerAccountId: text().notNull(),
    /** nome exibido na plataforma externa (ex.: "lumina_plays") */
    providerUsername: text(),
    // ⚠️ Tokens devem ser criptografados pela API antes de salvar.
    accessToken: text(),
    refreshToken: text(),
    expiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    ...timestamps,
  },
  (t) => [
    unique('accounts_provider_account_unique').on(t.provider, t.providerAccountId),
    index('accounts_user_idx').on(t.userId),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  reviews: many(reviews),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));
