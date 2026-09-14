import { EpisodeNotFoundError } from '../../domain/index.js';

import type {
  CharacterGateway,
  EpisodeAppearance,
  EpisodeGateway,
  EpisodeRecord,
} from '../../application/ports/index.js';
import type { Character, EpisodeNumber } from '../../domain/index.js';

export interface CatalogSnapshot {
  readonly generatedAt: string;
  readonly episodes: readonly EpisodeRecord[];
  readonly characters: readonly Character[];
}

export class SnapshotGateway implements EpisodeGateway, CharacterGateway {
  private readonly episodes: Map<number, EpisodeRecord>;
  private readonly characters: Map<number, Character>;

  constructor(snapshot: CatalogSnapshot) {
    this.episodes = new Map(snapshot.episodes.map((episode) => [episode.number, episode]));
    this.characters = new Map(snapshot.characters.map((character) => [character.id, character]));
  }

  findEpisode(episodeNumber: EpisodeNumber): Promise<EpisodeRecord> {
    const episode = this.episodes.get(episodeNumber.value);

    return episode
      ? Promise.resolve(episode)
      : Promise.reject(new EpisodeNotFoundError(episodeNumber.value));
  }

  findCharactersByIds(ids: readonly number[]): Promise<readonly Character[]> {
    const found = ids
      .map((id) => this.characters.get(id))
      .filter((character): character is Character => character !== undefined);

    return Promise.resolve(found);
  }

  findCharacterAppearances(characterId: number): Promise<readonly EpisodeAppearance[]> {
    const appearances: EpisodeAppearance[] = [];

    for (const episode of this.episodes.values()) {
      if (episode.characterIds.includes(characterId)) {
        appearances.push({ number: episode.number, code: episode.code, name: episode.name });
      }
    }

    return Promise.resolve(appearances.toSorted((a, b) => a.number - b.number));
  }

  listEpisodeNumbers(): Promise<readonly number[]> {
    return Promise.resolve([...this.episodes.keys()].toSorted((a, b) => a - b));
  }

  get isEmpty(): boolean {
    return this.episodes.size === 0;
  }
}
