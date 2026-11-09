# Kritica · setup dos packages

Estrutura esperada do repositório:

```
kritica/
├─ apps/
│  ├─ api/          ← seu NestJS (antigo backend/)
│  └─ web/          ← seu Next.js (antigo frontend/)
├─ packages/
│  ├─ config/       ← tsconfigs compartilhados
│  ├─ contracts/    ← schemas Zod + tipos (front ↔ back)
│  └─ db/           ← Drizzle: schema, migrations, client, seed
├─ docker-compose.yml
├─ package.json
├─ pnpm-workspace.yaml
└─ turbo.json
```

Regra de dependências: `web → contracts` · `api → contracts + db` · `db → contracts`.
**O web nunca importa `@kritica/db`.**

---

## 1. Copiar os arquivos

Extraia o zip **na raiz** do repositório `kritica` (mesclando com o que já existe).

Se suas pastas ainda se chamam `backend/` e `frontend/`, mova (PowerShell, na raiz):

```powershell
mkdir apps
Move-Item backend apps\api
Move-Item frontend apps\web
```

Apague os `node_modules` e lockfiles que o `nest new` / `create-next-app` criaram dentro dos apps
(o pnpm vai instalar tudo de uma vez a partir da raiz):

```powershell
Remove-Item -Recurse -Force apps\api\node_modules, apps\web\node_modules -ErrorAction SilentlyContinue
Remove-Item -Force apps\api\package-lock.json, apps\api\pnpm-lock.yaml, apps\web\package-lock.json, apps\web\pnpm-lock.yaml -ErrorAction SilentlyContinue
```

## 2. pnpm

```powershell
corepack enable
corepack use pnpm@latest   # atualiza o campo "packageManager" para a sua versão
pnpm install
```

> As versões nos `package.json` foram as que instalei e testei
> (drizzle-orm 0.45, drizzle-kit 0.31, zod 4, postgres 4, TypeScript 7).

## 3. Banco local e .env

Copie os arquivos de ambiente (não vão para o git):

```powershell
Copy-Item packages\db\.env.example packages\db\.env
Copy-Item apps\api\.env.example apps\api\.env
```

**Opção A — Postgres instalado na máquina:** crie o banco `kritica` e ajuste o
`DATABASE_URL` em `packages\db\.env` (ex.: `postgres://postgres:SUA_SENHA@localhost:5432/kritica`).

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "create database kritica"
```

**Opção B — Docker:** com o Docker Desktop rodando, `docker compose up -d` (o `.env.example` já bate com ele).

## 4. Build, migration e seed

```powershell
pnpm build          # compila config → contracts → db
pnpm db:generate    # cria a primeira migration em packages/db/drizzle/
pnpm db:migrate     # aplica no Postgres
pnpm db:seed        # 5 plataformas, 5 gêneros, 3 jogos (pode rodar quantas vezes quiser)
pnpm db:studio      # opcional: abre o Drizzle Studio para ver as tabelas
```

**Commite a pasta `packages/db/drizzle/`** — as migrations fazem parte do código.

## 5. Ligar os apps aos packages

**apps/api** (`package.json`):

```json
"dependencies": {
  "@kritica/contracts": "workspace:*",
  "@kritica/db": "workspace:*"
}
```

**apps/web** (`package.json`):

```json
"dependencies": {
  "@kritica/contracts": "workspace:*"
}
```

Depois rode `pnpm install` de novo na raiz.

**tsconfig do Nest:** se o `nest new` gerou o projeto em ESM com `"module": "NodeNext"`, pode manter o tsconfig dele.
Se quiser padronizar, troque o topo por `"extends": "@kritica/config/tsconfig/nestjs.json"` e mantenha
só `outDir`, `rootDir`/`baseUrl` e `include` do original. Adicione `"@kritica/config": "workspace:*"`
nas devDependencies do api.

**tsconfig do Next:** mantenha o que o `create-next-app` gerou (ele usa `moduleResolution: bundler`, que é o certo para o Next).

## 6. Dia a dia

```powershell
pnpm dev     # compila os packages em watch e sobe api + web juntos
```

Exemplo de uso na API:

```ts
import { createDb, games, eq } from '@kritica/db';
import { createReviewSchema, scoreToTenths } from '@kritica/contracts';

const { db } = createDb(process.env.DATABASE_URL!);
const game = await db.query.games.findFirst({ where: eq(games.slug, 'elden-ring') });
```

## Convenções importantes

- **Notas** são guardadas em décimos no banco (`95` = 9.5). Converta sempre com
  `scoreToTenths` / `tenthsToScore` do `@kritica/contracts`. O banco recusa valores fora de 0–100 ou que não sejam múltiplos de 5.
- **Enums** (`platform_family`, `account_provider`) vêm do `@kritica/contracts`. Para adicionar uma plataforma,
  edite `PLATFORM_FAMILIES` lá e rode `pnpm build && pnpm db:generate && pnpm db:migrate`.
- **Mudou o schema?** `pnpm db:generate` → revise o SQL gerado → `pnpm db:migrate` → commit.
- **Tokens OAuth** (tabela `accounts`) devem ser criptografados pela API antes de salvar.
