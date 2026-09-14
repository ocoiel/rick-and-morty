export interface EpisodeAppearance {
  readonly number: number;
  readonly code: string;
  readonly name: string;
}

export interface CharacterGateway {
  findCharacterAppearances(characterId: number): Promise<readonly EpisodeAppearance[]>;
}
