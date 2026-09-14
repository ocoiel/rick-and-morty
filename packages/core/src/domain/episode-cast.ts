import type { Character } from './character.js';
import type { EpisodeNumber } from './episode-number.js';

export interface EpisodeIdentity {
  readonly number: EpisodeNumber;
  readonly name: string;
  readonly code: string;
  readonly airDate: string;
}

const NAME_COLLATOR = new Intl.Collator('pt-BR', {
  sensitivity: 'base',
  numeric: true,
  usage: 'sort',
});

function byNameThenId(a: Character, b: Character): number {
  return NAME_COLLATOR.compare(a.name, b.name) || a.id - b.id;
}

export class EpisodeCast {
  private constructor(
    readonly episode: EpisodeIdentity,
    readonly characters: readonly Character[],
  ) {}

  static assemble(episode: EpisodeIdentity, characters: readonly Character[]): EpisodeCast {
    return new EpisodeCast(episode, characters.toSorted(byNameThenId));
  }

  get size(): number {
    return this.characters.length;
  }

  get isEmpty(): boolean {
    return this.characters.length === 0;
  }
}
