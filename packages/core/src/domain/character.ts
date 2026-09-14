export type CharacterStatus = 'Alive' | 'Dead' | 'unknown';

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
