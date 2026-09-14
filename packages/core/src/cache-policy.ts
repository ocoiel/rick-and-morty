/**
 * O catálogo de Rick and Morty é imutável na prática: episódios e personagens
 * não mudam. Um único número governa por quanto tempo os dados são válidos,
 * tanto no cache em memória (ms) quanto no cabeçalho HTTP enviado ao cliente (s).
 */
export const ONE_DAY_SECONDS = 86_400;

export const ONE_DAY_MS = ONE_DAY_SECONDS * 1000;

export const PUBLIC_DAY_CACHE_CONTROL = `public, max-age=${ONE_DAY_SECONDS}, stale-while-revalidate=${ONE_DAY_SECONDS}`;
