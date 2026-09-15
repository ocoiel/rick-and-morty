// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'character.dart';
import 'episode.dart';
import 'meta.dart';

part 'episode_cast.g.dart';

@JsonSerializable()
class EpisodeCast {
  const EpisodeCast({
    required this.episode,
    required this.characters,
    required this.meta,
  });
  
  factory EpisodeCast.fromJson(Map<String, Object?> json) => _$EpisodeCastFromJson(json);
  
  final Episode episode;
  final List<Character> characters;
  final Meta meta;

  Map<String, Object?> toJson() => _$EpisodeCastToJson(this);
}
