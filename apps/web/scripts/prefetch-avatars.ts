import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import sharp from 'sharp';

import type { CatalogSnapshot } from '@zrp/core';

const SNAPSHOT_PATH = new URL('../lib/catalog-snapshot.json', import.meta.url);
const OUTPUT_DIR = new URL('../public/avatars/', import.meta.url);

/**
 * A própria Rick and Morty API publica os avatares no repositório dela, sob
 * BSD-3. São os mesmos arquivos: images/1.jpeg tem o mesmo SHA-256 que
 * /api/character/avatar/1.jpeg.
 *
 * Buscar de lá evita o rate limit da API, que é um limite do Cloudflare por IP
 * (erro 1015) avaliado antes do cache: ~150 requisições de estouro e reposição
 * de ~1,6/s, compartilhado entre imagens e JSON. Baixar os 826 avatares de lá
 * levava 3m34s; o tarball é uma requisição só.
 *
 * O commit é fixo para o build ser reprodutível.
 */
const REPO_COMMIT = 'ca9118a9da49e69c6387357e0f02163f53a79be4';
const TARBALL_URL = `https://codeload.github.com/afuh/rick-and-morty-api/tar.gz/${REPO_COMMIT}`;

/** Os cards nunca passam de 320px de lado; guardar maior é desperdício. */
const EDGE_PX = 320;
const QUALITY = 78;

const execFileAsync = promisify(execFile);
const log = (message: string) => process.stdout.write(`${message}\n`);

async function downloadImages(workDir: string): Promise<string> {
  const tarball = join(workDir, 'repo.tar.gz');

  const response = await fetch(TARBALL_URL);
  if (!response.ok) {
    throw new Error(`Não foi possível baixar os avatares: ${response.status}.`);
  }

  await writeFile(tarball, Buffer.from(await response.arrayBuffer()));

  // --strip-components=1 tira o diretório com o nome do commit.
  await execFileAsync('tar', ['-xzf', tarball, '-C', workDir, '--strip-components=1', '*/images']);

  return join(workDir, 'images');
}

async function listCached(): Promise<Set<number>> {
  const entries = await readdir(fileURLToPath(OUTPUT_DIR)).catch(() => []);

  return new Set(
    entries
      .filter((name) => name.endsWith('.webp'))
      .map((name) => Number(name.replace('.webp', ''))),
  );
}

async function main() {
  const snapshot = JSON.parse(await readFile(SNAPSHOT_PATH, 'utf8')) as CatalogSnapshot;
  await mkdir(OUTPUT_DIR, { recursive: true });

  const cached = await listCached();
  const missing = snapshot.characters
    .map((character) => character.id)
    .filter((id) => !cached.has(id));

  if (missing.length === 0) {
    log(`Avatares: ${cached.size} já em disco.`);
    return;
  }

  const workDir = await mkdtemp(join(tmpdir(), 'avatars-'));

  try {
    const startedAt = Date.now();
    const imagesDir = await downloadImages(workDir);

    const written = await Promise.all(
      missing.map(async (id) => {
        const source = await readFile(join(imagesDir, `${id}.jpeg`)).catch(() => null);
        if (!source) return null;

        const webp = await sharp(source)
          .resize(EDGE_PX, EDGE_PX, { fit: 'cover' })
          .webp({ quality: QUALITY })
          .toBuffer();

        await writeFile(fileURLToPath(new URL(`${id}.webp`, OUTPUT_DIR)), webp);
        return id;
      }),
    );

    const generated = written.filter((id) => id !== null).length;
    const absent = missing.length - generated;
    const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);

    log(
      `Avatares: ${generated} gerados em ${seconds}s` +
        (absent > 0 ? ` (${absent} sem imagem no repositório)` : '') +
        `, ${cached.size} já em disco.`,
    );
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

await main();
