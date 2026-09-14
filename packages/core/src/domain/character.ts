/** Situação vital do personagem, conforme vocabulário da fonte de dados. */
export type CharacterStatus = 'Alive' | 'Dead' | 'unknown';

/**
 * Personagem que participa de um episódio.
 *
 * Modelado como dado imutável: no contexto desta aplicação um personagem não
 * tem comportamento próprio — quem carrega regra é o agregado EpisodeCast.
 */
export interface Character {
  readonly id: number;
  readonly name: string;
  readonly status: CharacterStatus;
  readonly species: string;
  readonly gender: string;
  readonly origin: string;
  readonly location: string;
  readonly imageUrl: string;
}
