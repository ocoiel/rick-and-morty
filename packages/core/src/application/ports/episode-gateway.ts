import type { Character, EpisodeNumber } from '../../domain/index.ts';

export interface EpisodeRecord {
  readonly number: number;
  readonly name: string;
  readonly code: string;
  readonly airDate: string;
  readonly characterIds: readonly number[];
}

export interface EpisodeGateway {
  findEpisode(episodeNumber: EpisodeNumber): Promise<EpisodeRecord>;
  findCharactersByIds(ids: readonly number[]): Promise<readonly Character[]>;
  listEpisodeNumbers(): Promise<readonly number[]>;
}
