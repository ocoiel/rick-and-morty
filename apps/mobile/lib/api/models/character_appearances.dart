// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'episodes.dart';

part 'character_appearances.g.dart';

@JsonSerializable()
class CharacterAppearances {
  const CharacterAppearances({
    required this.characterId,
    required this.episodes,
  });
  
  factory CharacterAppearances.fromJson(Map<String, Object?> json) => _$CharacterAppearancesFromJson(json);
  
  final int characterId;
  final List<Episodes> episodes;

  Map<String, Object?> toJson() => _$CharacterAppearancesToJson(this);
}
