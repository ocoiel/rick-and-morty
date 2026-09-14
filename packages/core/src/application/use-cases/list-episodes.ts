import type { EpisodeGateway } from '../ports/index.js';

export class ListEpisodeNumbersUseCase {
  constructor(private readonly episodes: EpisodeGateway) {}

  execute(): Promise<readonly number[]> {
    return this.episodes.listEpisodeNumbers();
  }
}
