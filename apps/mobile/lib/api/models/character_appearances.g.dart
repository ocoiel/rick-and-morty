// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'character_appearances.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CharacterAppearances _$CharacterAppearancesFromJson(
  Map<String, dynamic> json,
) => CharacterAppearances(
  characterId: (json['characterId'] as num).toInt(),
  episodes: (json['episodes'] as List<dynamic>)
      .map((e) => Episodes.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$CharacterAppearancesToJson(
  CharacterAppearances instance,
) => <String, dynamic>{
  'characterId': instance.characterId,
  'episodes': instance.episodes,
};
