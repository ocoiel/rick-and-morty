import { writeFile } from 'node:fs/promises';
import { createContainer } from '@zrp/core';

const OUTPUT = new URL('../lib/episode-catalog.ts', import.meta.url);
const FALLBACK_TOTAL = 51;

async function resolveTotal(): Promise<number> {
  try {
    const container = createContainer({
      ...(process.env.RICK_AND_MORTY_API_URL && {
        apiBaseUrl: process.env.RICK_AND_MORTY_API_URL,
      }),
    });
    const episodes = await container.listEpisodeNumbers.execute();

    return episodes.length > 0 ? episodes.length : FALLBACK_TOTAL;
  } catch {
    process.stdout.write(
      `Origem indisponível ao gerar catálogo; usando ${FALLBACK_TOTAL} episódios.\n`,
    );
    return FALLBACK_TOTAL;
  }
}

const total = await resolveTotal();

await writeFile(OUTPUT, `export const TOTAL_EPISODES = ${total};\n`, 'utf8');

process.stdout.write(`Catálogo gerado: ${total} episódios.\n`);
