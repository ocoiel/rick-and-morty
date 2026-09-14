import { createContainer, InMemoryCacheStore } from '@zrp/core';
import { InMemoryEpisodeGateway, makeCharacter, makeEpisodeRecord } from '@zrp/core/testing';
import { loadConfig } from '../src/config.ts';
import { buildServer } from '../src/server.ts';

import type { EpisodeGateway } from '@zrp/core';

export function buildFakeGateway(): InMemoryEpisodeGateway {
  return new InMemoryEpisodeGateway({
    episodes: [
      makeEpisodeRecord({ number: 1, characterIds: [1, 2, 35] }),
      makeEpisodeRecord({ number: 2, name: 'Lawnmower Dog', code: 'S01E02', characterIds: [] }),
    ],
    characters: [
      makeCharacter({ id: 1, name: 'Rick Sanchez' }),
      makeCharacter({ id: 2, name: 'Morty Smith' }),
      makeCharacter({ id: 35, name: 'Ábradolf Lincler' }),
    ],
  });
}

export function buildTestServer(episodeGateway: EpisodeGateway = buildFakeGateway()) {
  return buildServer({
    config: loadConfig({ LOG_LEVEL: 'silent' } as NodeJS.ProcessEnv),
    container: createContainer({ episodeGateway, cacheStore: new InMemoryCacheStore() }),
  });
}
