import { createContainer, SnapshotGateway, type CatalogSnapshot, type Container } from '@zrp/core';
import snapshot from './catalog-snapshot.json' with { type: 'json' };

const CONTAINER_KEY = Symbol.for('zrp.container');

type GlobalWithContainer = typeof globalThis & { [CONTAINER_KEY]?: Container };

function buildContainer(): Container {
  const catalog = new SnapshotGateway(snapshot as CatalogSnapshot);

  if (!catalog.isEmpty) {
    return createContainer({ episodeGateway: catalog, characterGateway: catalog });
  }

  return createContainer({
    ...(process.env.RICK_AND_MORTY_API_URL && {
      apiBaseUrl: process.env.RICK_AND_MORTY_API_URL,
    }),
    timeoutMs: Number(process.env.UPSTREAM_TIMEOUT_MS ?? 5000),
    retries: Number(process.env.UPSTREAM_RETRIES ?? 5),
  });
}

const globalScope = globalThis as GlobalWithContainer;

export const container: Container = globalScope[CONTAINER_KEY] ?? buildContainer();

globalScope[CONTAINER_KEY] = container;
