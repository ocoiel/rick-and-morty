import type { Character } from './character.js';
import type { EpisodeNumber } from './episode-number.js';

export interface EpisodeIdentity {
  readonly number: EpisodeNumber;
  /** Nome do episódio. Ex.: "The Ricklantis Mixup". */
  readonly name: string;
  /** Código de exibição. Ex.: "S03E07". */
  readonly code: string;
  /** Data de exibição original, como texto, tal como publicada pela fonte. */
  readonly airDate: string;
}

/**
 * Instanciar um Intl.Collator é caro; comparar com ele é barato.
 * Como a ordenação é a regra de negócio mais executada do sistema, o collator
 * é criado uma única vez por processo e reutilizado em toda comparação.
 *
 * - sensitivity 'base': "Ábradolf" ordena junto de "Abradolf", e não no fim da
 *   lista como aconteceria com a comparação por code point de String.prototype.sort.
 * - numeric: "Rick 2" vem antes de "Rick 10", e não depois.
 */
const NAME_COLLATOR = new Intl.Collator('pt-BR', {
  sensitivity: 'base',
  numeric: true,
  usage: 'sort',
});

/**
 * Agregado que representa o elenco de um episódio.
 *
 * A ordenação alfabética é requisito de negócio, não detalhe de apresentação.
 * Por isso ela vive aqui: qualquer adaptador que consuma este agregado recebe
 * o elenco já ordenado, sem poder esquecer de ordenar.
 */
export class EpisodeCast {
  private constructor(
    readonly episode: EpisodeIdentity,
    /** Personagens em ordem alfabética estável. */
    readonly characters: readonly Character[],
  ) {}

  static assemble(episode: EpisodeIdentity, characters: readonly Character[]): EpisodeCast {
    return new EpisodeCast(episode, EpisodeCast.sortByName(characters));
  }

  /**
   * Ordena por nome; empates são resolvidos pelo id para que a ordem seja
   * determinística. Isso importa: páginas são geradas estaticamente e
   * comparadas em teste — duas execuções precisam produzir a mesma saída.
   */
  private static sortByName(characters: readonly Character[]): readonly Character[] {
    return [...characters].sort((a, b) => {
      const byName = NAME_COLLATOR.compare(a.name, b.name);
      return byName !== 0 ? byName : a.id - b.id;
    });
  }

  get size(): number {
    return this.characters.length;
  }

  get isEmpty(): boolean {
    return this.characters.length === 0;
  }
}
