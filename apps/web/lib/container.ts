import { createContainer, type Container } from '@zrp/core';

const CONTAINER_KEY = Symbol.for('zrp.container');

type GlobalWithContainer = typeof globalThis & { [CONTAINER_KEY]?: Container };

function buildContainer(): Container {
  return createContainer({
    ...(process.env.RICK_AND_MORTY_API_URL && {
      apiBaseUrl: process.env.RICK_AND_MORTY_API_URL,
    }),
    timeoutMs: Number(process.env.UPSTREAM_TIMEOUT_MS ?? 5000),
    retries: Number(process.env.UPSTREAM_RETRIES ?? 4),
  });
}

const globalScope = globalThis as GlobalWithContainer;

export const container: Container = globalScope[CONTAINER_KEY] ?? buildContainer();

globalScope[CONTAINER_KEY] = container;
