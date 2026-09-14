const ONE_DAY_SECONDS = 86_400;

/** O elenco de um episódio não muda: a resposta vale por um dia inteiro. */
export const PUBLIC_DAY_CACHE_CONTROL = `public, max-age=${ONE_DAY_SECONDS}, stale-while-revalidate=${ONE_DAY_SECONDS}`;
