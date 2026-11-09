/**
 * Popula o banco com alguns jogos para desenvolver sem depender do IGDB.
 * Uso: pnpm db:seed  (depois de pnpm db:migrate)
 */
import 'dotenv/config';
import { createDb, gameGenres, gamePlatforms, games, genres, platforms } from '../src/index.js';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL não definida (veja packages/db/.env.example)');

const { db, close } = createDb(url, { max: 1 });

const platformRows = [
  { slug: 'pc', name: 'PC', family: 'pc' },
  { slug: 'ps5', name: 'PlayStation 5', family: 'playstation' },
  { slug: 'xbox-series', name: 'Xbox Series X|S', family: 'xbox' },
  { slug: 'switch', name: 'Nintendo Switch', family: 'nintendo' },
  { slug: 'mobile', name: 'iOS / Android', family: 'mobile' },
] as const;

const genreRows = [
  { slug: 'rpg', name: 'RPG' },
  { slug: 'adventure', name: 'Aventura' },
  { slug: 'indie', name: 'Indie' },
  { slug: 'platform', name: 'Plataforma' },
  { slug: 'card-game', name: 'Jogo de cartas' },
] as const;

const gameRows = [
  {
    slug: 'elden-ring',
    name: 'Elden Ring',
    releaseDate: '2022-02-25',
    platforms: ['pc', 'ps5', 'xbox-series'],
    genres: ['rpg', 'adventure'],
  },
  {
    slug: 'hollow-knight',
    name: 'Hollow Knight',
    releaseDate: '2017-02-24',
    platforms: ['pc', 'ps5', 'xbox-series', 'switch'],
    genres: ['platform', 'adventure', 'indie'],
  },
  {
    slug: 'balatro',
    name: 'Balatro',
    releaseDate: '2024-02-20',
    platforms: ['pc', 'ps5', 'xbox-series', 'switch', 'mobile'],
    genres: ['card-game', 'indie'],
  },
];

async function main() {
  await db.transaction(async (tx) => {
    await tx.insert(platforms).values([...platformRows]).onConflictDoNothing({ target: platforms.slug });
    await tx.insert(genres).values([...genreRows]).onConflictDoNothing({ target: genres.slug });

    const platformIds = new Map((await tx.select().from(platforms)).map((p) => [p.slug, p.id]));
    const genreIds = new Map((await tx.select().from(genres)).map((g) => [g.slug, g.id]));

    for (const g of gameRows) {
      const [game] = await tx
        .insert(games)
        .values({ slug: g.slug, name: g.name, releaseDate: g.releaseDate })
        .onConflictDoUpdate({ target: games.slug, set: { name: g.name, releaseDate: g.releaseDate } })
        .returning({ id: games.id });
      if (!game) continue;

      await tx
        .insert(gamePlatforms)
        .values(g.platforms.map((slug) => ({ gameId: game.id, platformId: platformIds.get(slug)! })))
        .onConflictDoNothing();
      await tx
        .insert(gameGenres)
        .values(g.genres.map((slug) => ({ gameId: game.id, genreId: genreIds.get(slug)! })))
        .onConflictDoNothing();
    }
  });

  console.log(`✔ Seed concluído: ${platformRows.length} plataformas, ${genreRows.length} gêneros, ${gameRows.length} jogos`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(close);
