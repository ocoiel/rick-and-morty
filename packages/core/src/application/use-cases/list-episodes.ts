import type { EpisodeGateway } from '../ports/index.ts';

export class ListEpisodeNumbersUseCase {
  constructor(private readonly episodes: EpisodeGateway) {}

  execute(): Promise<readonly number[]> {
    return this.episodes.listEpisodeNumbers();
  }
}
