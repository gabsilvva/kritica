import { ACCOUNT_PROVIDERS, PLATFORM_FAMILIES } from '@kritica/contracts';
import { pgEnum } from 'drizzle-orm/pg-core';

// Valores vêm do @kritica/contracts: banco, API e front sempre iguais.
export const platformFamilyEnum = pgEnum('platform_family', PLATFORM_FAMILIES);
export const accountProviderEnum = pgEnum('account_provider', ACCOUNT_PROVIDERS);
