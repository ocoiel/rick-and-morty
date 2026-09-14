import { writeFile } from 'node:fs/promises';
import { RickAndMortyHttpGateway } from '@zrp/core';

import type { CatalogSnapshot } from '@zrp/core';

const SNAPSHOT_PATH = new URL('../lib/catalog-snapshot.json', import.meta.url);
const TOTAL_PATH = new URL('../lib/episode-catalog.ts', import.meta.url);

const log = (message: string) => process.stdout.write(`${message}\n`);

async function buildSnapshot(): Promise<CatalogSnapshot> {
  const gateway = new RickAndMortyHttpGateway({
    ...(process.env.RICK_AND_MORTY_API_URL && { baseUrl: process.env.RICK_AND_MORTY_API_URL }),
    maxConcurrency: 2,
    retries: 8,
    backoffBaseMs: 800,
    timeoutMs: 15_000,
  });

  const episodes = await gateway.listEpisodes();
  const characterIds = [...new Set(episodes.flatMap((episode) => episode.characterIds))].toSorted(
    (a, b) => a - b,
  );
  const characters = await gateway.findCharactersByIds(characterIds);

  return {
    generatedAt: new Date().toISOString(),
    episodes,
    characters: characters.toSorted((a, b) => a.id - b.id),
  };
}

const snapshot = await buildSnapshot();

if (snapshot.episodes.length === 0) {
  throw new Error(
    'A origem devolveu um catálogo vazio; abortando para não publicar um site vazio.',
  );
}

await writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
await writeFile(TOTAL_PATH, `export const TOTAL_EPISODES = ${snapshot.episodes.length};\n`, 'utf8');

log(`Catálogo: ${snapshot.episodes.length} episódios e ${snapshot.characters.length} personagens.`);
