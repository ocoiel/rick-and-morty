import 'package:rick_and_morty/api/export.dart';

Character makeCharacter({
  int id = 1,
  String name = 'Rick Sanchez',
  CharacterStatus status = CharacterStatus.alive,
}) {
  return Character(
    id: id,
    name: name,
    status: status,
    species: 'Human',
    gender: 'Male',
    origin: 'Earth (C-137)',
    location: 'Citadel of Ricks',
    imageUrl: 'https://rickandmortyapi.com/api/character/avatar/$id.jpeg',
  );
}

EpisodeCast makeEpisodeCast({List<Character>? characters}) {
  final cast = characters ??
      [
        makeCharacter(id: 35, name: 'Ábradolf Lincler'),
        makeCharacter(id: 2, name: 'Morty Smith'),
        makeCharacter(),
      ];

  return EpisodeCast(
    episode: Episode(
      number: 1,
      name: 'Pilot',
      code: 'S01E01',
      airDate: 'December 2, 2013',
    ),
    characters: cast,
    meta: Meta(total: cast.length, source: Source.origin),
  );
}
