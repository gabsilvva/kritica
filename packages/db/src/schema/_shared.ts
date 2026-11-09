import { timestamp } from 'drizzle-orm/pg-core';

/** createdAt/updatedAt padrão (com fuso horário) */
export const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
