export * from './client.js';
export * as schema from './schema/index.js';
export * from './schema/index.js';

// Reexporta helpers de query para a API não precisar depender do drizzle-orm diretamente
export { and, asc, count, desc, eq, gt, gte, ilike, inArray, isNull, lt, lte, or, sql } from 'drizzle-orm';
