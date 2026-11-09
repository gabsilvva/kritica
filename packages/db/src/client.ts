import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

export interface CreateDbOptions {
  /** Máximo de conexões no pool (padrão 10) */
  max?: number;
}

/**
 * Cria a conexão com o Postgres. Na API (Nest), crie uma única vez
 * num provider e injete onde precisar.
 */
export function createDb(url: string, options: CreateDbOptions = {}) {
  const client = postgres(url, { max: options.max ?? 10 });
  const db = drizzle({ client, schema, casing: 'snake_case' });
  return { db, close: () => client.end() };
}

export type Database = ReturnType<typeof createDb>['db'];
